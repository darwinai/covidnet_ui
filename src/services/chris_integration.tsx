import Client, { IPluginCreateData, Note, FeedPluginInstanceList, PluginInstance, PluginInstanceFileList, Feed, FeedList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { ISeries, selectedImageType, StudyInstanceWithSeries, TPluginStatuses } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import DicomViewerService from "../services/dicomViewerService";
import { PluginModels, FEED_NOTE_TITLE } from "../app.config";
import { formatTime, modifyDatetime } from "../shared/utils"
import { groupBy } from "lodash";

export interface LocalFile {
  name: string;
  blob: Blob;
}

export type DircopyResult = {
  instance: PluginInstance, 
  img: DcmImage
}

export type TAnalysisResults = {
  series: ISeries[];
  classifications: string[];
}

type TFeedNoteContent = {
  timestamp: number,
  img: DcmImage
}

type TFeedNote = {
  feed: Feed,
  note: TFeedNoteContent
}

interface DirCreateData extends IPluginCreateData {
  dir: string;
}

interface PlcovidnetData extends IPluginCreateData {
  imagefile: string;
}

interface PACSFile {
  url: string;
  auth: {
    token: string;
  };
  contentType: string;
  collection: Object;
  data: DcmImage;
}

enum PluginPollStatus {
  CREATED = "created",
  WAITING = "waiting",
  SCHEDULED = "scheduled",
  STARTED = "started",
  REGISTERING_FILES = "registeringFiles",
  SUCCESS = "finishedSuccessfully",
  ERROR = "finishedWithError",
  CANCELLED = "cancelled"
}

export interface BackendPollResult {
  plugin: string;
  status?: PluginPollStatus;
  error?: Error;
}

export interface pluginData {
  title: string,
  status: string,
  plugin_name: string
}

export const pollingBackend = async (pluginInstance: PluginInstance): Promise<BackendPollResult> => {
  const maxWaitInterval = 600000; // 10 minutes
  let waitInterval = 1000;
  const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  await timeout(waitInterval);
  let res: any = await pluginInstance.get();

  const shouldWait = () => (waitInterval < maxWaitInterval
    && ![PluginPollStatus.CANCELLED, PluginPollStatus.ERROR, PluginPollStatus.SUCCESS].includes(res.data.status))

  while (shouldWait()) {
    await timeout(waitInterval);
    res = await pluginInstance.get(); // This is not async!!
    console.log(`${res.data.plugin_name}: ${res.data.status}`);
    waitInterval *= 2;
  }

  const result = {
    plugin: res.data.plugin_name,
    status: res.data.status
  }

  if (waitInterval > maxWaitInterval) {
    return { error: new Error('terminated due to timeout'), ...result }
  } else if ([PluginPollStatus.CANCELLED, PluginPollStatus.ERROR].includes(res.data.status)) {
    return { error: new Error(`exited with status '${res.data.status}'`), ...result }
  } else {
    return result;
  }
}

// Dynamically loop through all model plug-ins and check if the current plug-in is valid
export const isModel = (modelName: string): boolean => ((Object.values(PluginModels.XrayModels).includes(modelName) || Object.values(PluginModels.CTModels).includes(modelName)));

class ChrisIntegration {

  static async getTotalAnalyses(): Promise<number> {
    let client: any = await ChrisAPIClient.getClient();
    const feeds = await client.getFeeds({
      limit: 100,
      offset: 0,
    });
    let count = 0;
    for (let feed of feeds.getItems()) {
      if (feed.data.finished_jobs >= 2)
        count++;
    }
    return count;
  }

  // old code used for manually uploaded image analysis
  static async processNewAnalysis(files: LocalFile[]): Promise<boolean> {
    let client: any = await ChrisAPIClient.getClient();
    try {
      // upload file
      const uploadedFile = await client.uploadFile({
        "upload_path": `chris/uploads/covidnet/${files[0].name}`
      }, { "fname": files[0].blob })

      // create dircopy plugin
      const dircopyPlugin = (await client.getPlugins({ 'name_exact': PluginModels.Plugins.FS_PLUGIN })).getItems()[0];
      const data: DirCreateData = { "dir": uploadedFile.data.fname }
      const pluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);

      const filename = uploadedFile.data.fname.split('/').pop()
      // create covidnet plugin
      const plcovidnet_data: PlcovidnetData = {
        previous_id: pluginInstance.data.id,
        // title: this.PL_COVIDNET,
        imagefile: filename
      }
      const plcovidnet = await client.getPlugins({ "name_exact": PluginModels.XrayModels["COVID-Net"] })
      const covidnetPlugin = plcovidnet.getItems()[0]
      const covidnetInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);
      console.log("Covidnet Running")
      await pollingBackend(covidnetInstance)
    } catch (err) {
      console.log(err)
      return false
    }
    return true;
  }

  /**
   * Runs pl-med2-img and pl-covidnet/pl-ct-covidnet on a DcmImage, given its pl-dircopy instance obtained from runDircopy
   * @param img DcmImage
   * @param dircopyPluginInstance instance obtained from runDircopy
   * @param chosenXrayModel name of model to be used for pl-covidnet
   * @param chosenCTModel name of model to be used for pl-ct-covidnet
   * @returns plugin result after polling
   */
   static async processOneImg(img: DcmImage, timestamp: number, chosenXrayModel: string, chosenCTModel: string): Promise<BackendPollResult> {
    let client: Client = await ChrisAPIClient.getClient();

    let XRayModel: string = PluginModels.XrayModels[chosenXrayModel]; // Configuring ChRIS to use the correct Xray model
    let CTModel: string = PluginModels.CTModels[chosenCTModel]; // Configuring ChRIS to use the correct CT model

    try {
      console.log(img.fname);

      // PL-DIRCOPY
      const dircopyPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.FS_PLUGIN })).getItems()[0];
      const data: DirCreateData = { "dir": img.fname, title: img.PatientID };
      const dircopyPluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);
      const feed = await dircopyPluginInstance.getFeed();
      const note = await feed?.getNote();
      await note?.put({
        title: FEED_NOTE_TITLE,
        content: JSON.stringify({
          timestamp,
          img
        })
      })
      console.log("PL-DIRCOPY task sent into the task queue")

      // PL-MED2IMG
      const imgConverterPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.MED2IMG })).getItems()[0];
      const filename = img.fname.split('/').pop()?.split('.')[0];
      console.log(filename);
      const imgData = {
        inputFile: img.fname.split('/').pop(),
        sliceToConvert: 0,
        outputFileStem: `${filename}.jpg`, //-slice000
        previous_id: dircopyPluginInstance.data.id
      }

      if (imgConverterPlugin === undefined || imgConverterPlugin.data === undefined) {
        return {
          plugin: PluginModels.Plugins.MED2IMG,
          error: new Error('not registered')
        };
      }

      const imgConverterInstance: PluginInstance = await client.createPluginInstance(imgConverterPlugin.data.id, imgData);
      console.log("PL-MED2IMG task sent into the task queue")

      const pluginNeeded = img.Modality === 'CR' ? XRayModel : CTModel;
      const covidnetPlugin = (await client.getPlugins({ "name_exact": pluginNeeded })).getItems()[0];
      const plcovidnet_data: PlcovidnetData = {
        previous_id: imgConverterInstance.data.id,
        title: img.fname,
        imagefile: `${filename}.jpg`
      }

      if (covidnetPlugin === undefined || covidnetPlugin.data === undefined) {
        return {
          plugin: pluginNeeded,
          error: new Error('not registered')
        };
      }
      await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);
      console.log(`${pluginNeeded.toUpperCase()} task sent into the task queue`)

      return {
          plugin: 'plugins'
      };
      
    } catch (err) {
      console.log(err);
      return {
        plugin: 'plugins',
        error: new Error('failed')
      };
    }
  }

  static async getDcmImageDetailByFilePathName(imgTitle: string): Promise<DcmImage> {
    const client: any = ChrisAPIClient.getClient();
    const files = await client.getPACSFiles({ fname_exact: imgTitle })
    return files?.data?.[0];
  }

  static async getFilePathNameByUID(StudyInstanceUID: string, SeriesInstanceUID: string): Promise<string> {
    let client: any = await ChrisAPIClient.getClient();

    const res = await client.getPACSFiles({
      StudyInstanceUID,
      SeriesInstanceUID,
      limit: 1
    });
    const patientImages: DcmImage = res.getItems().map((img: PACSFile) => img.data)?.[0];
    return patientImages.fname;
  }

  /**
   * Gets the ID of the latest Feed stored in Swift
   */
  static async getLatestFeedId(): Promise<number> {
    const client: any = ChrisAPIClient.getClient();
    const feeds = await client.getFeeds({
      limit: 1,
      offset: 0
    });
    return feeds.getItems()?.[0]?.data?.id;
  }

  /**
   * Returns true if the covidnet plugin associated with the given Feed id is in a terminated state (SUCCESS, ERROR, or CANCELLED)
   * @param {number} id
   */
  static async checkIfAnalysisFinished(id: number): Promise<boolean> {
    const client: Client = ChrisAPIClient.getClient();
    const plugin = await client.getPluginInstances({
      feed_id: id,
      plugin_name: "covidnet"
    });
    const status = plugin?.getItems()?.[0]?.data?.status;
    return status === PluginPollStatus.SUCCESS || status === PluginPollStatus.ERROR || status === PluginPollStatus.CANCELLED;
  }

  static async getPluginData(id: number): Promise<pluginData> {
    const client: any = ChrisAPIClient.getClient();
    const plugin = await client.getPluginInstances({
      feed_id: id,
      plugin_name: "covidnet"
    });
    return ({
      title: plugin?.data?.[0]?.title,
      status: plugin?.data?.[0]?.status,
      plugin_name: plugin?.data?.[0]?.plugin_name
    });
  }

  /**
   * Starting at the provided offset, coninuously fetches Feeds from Swift until able to return an array of
   * StudyInstanceWithSeries of the provided size (limit)
   * @param {number} offset Page offset
   * @param {number} limit Desired number of StudyInstanceWithSeries to receive
   * @param {number} max_id Maximum Feed ID search parameter
   */
  static async getPastAnalyses(offset: number, limit: number, max_id?: number): Promise<[StudyInstanceWithSeries[], number, boolean]> {
    const client: any = ChrisAPIClient.getClient();

    // Indicates when the last Feed on Swift has been reached to prevent further fetching
    let isAtEndOfFeeds = false;

    let curOffset = offset;
    const fetchLimit = limit;

    // Feed and Note data that have been fetched so far
    const feedNoteArray: TFeedNote[] = [];

    // Feeds grouped by [timestamp, StudyInstanceUID]
    let studyGroups: Object = {};

    // Keep fetching Feeds in batch sizes of "fetchLimit" and grouping them until studyGroups contains ("limit" + 1) number of groups
    while (Object.keys(studyGroups).length <= limit && !isAtEndOfFeeds) {
      const feeds: FeedList = await client.getFeeds({
        limit: fetchLimit,
        offset: curOffset,
        max_id
      });

      curOffset += fetchLimit;
      
      const feedArray: Feed[] = feeds?.getItems();

      // If the number of Feeds received was less than fetchLimit, end of Feeds has been reached
      isAtEndOfFeeds = feedArray?.length < fetchLimit;

      // Get Note data and pair it with the respective Feed
      const newFeedNoteArray: TFeedNote[] = (await Promise.all(feedArray.map(async (feed: Feed): Promise<TFeedNote[]> => {
        const note: Note = await feed.getNote();
        if (!note || note.data.title !== FEED_NOTE_TITLE) {
          return [];
        }
        const noteContent = JSON.parse(note?.data?.content);
        console.log(typeof noteContent)
        return [{
          feed,
          note: noteContent
        }];
      }))).flat();

      feedNoteArray.push(...newFeedNoteArray);

      // Group Feeds into an object by [timestamp, StudyInstanceUID]
      studyGroups = groupBy(feedNoteArray, (feedNote: any) => [feedNote.note.timestamp, feedNote.note.img.StudyInstanceUID]);
    }

    // If the end of Feeds was reached and number of groups doesn't exceed limit, this is the last page to be fetched
    const isLastPage = isAtEndOfFeeds && Object.keys(studyGroups).length <= limit;

    // Generate list of StudyInstanceWithSeries
    const pastAnalyses: StudyInstanceWithSeries[] = Object.values(studyGroups).map((feedNotes: TFeedNote[]): StudyInstanceWithSeries => {
      const firstFeedNote = feedNotes?.[0];

      const pluginStatuses = feedNotes.reduce((acc: TPluginStatuses, cur: TFeedNote) => {
        const feedData = cur.feed.data;
        if (feedData.finished_jobs === 3) {
          acc.jobsDone += 1
        } else if (feedData.errored_jobs + feedData.cancelled_jobs > 0) {
          acc.jobsErrored += 1
        } else {
          acc.jobsRunning += 1
        }
        return acc;
      }, {
        jobsDone: 0,
        jobsErrored: 0,
        jobsRunning: 0
      });

      const feedIds = feedNotes.map((feedNote: TFeedNote) => feedNote.feed.data.id);

      return {
        dcmImage: firstFeedNote.note.img,
        analysisCreated: modifyDatetime(firstFeedNote.note.timestamp),
        feedIds,
        pluginStatuses,
        series: []
      }
    });

    // Discard the extra analysis
    const pastAnalysesSliced = pastAnalyses.slice(0, limit);

    // Count the number of Feeds that are actually being used for this page and add to the initial offset
    const lastOffset = offset + pastAnalysesSliced.reduce((acc: number, cur: StudyInstanceWithSeries) => {
      return acc + cur.feedIds.length
    }, 0);

    return [pastAnalysesSliced, lastOffset, isLastPage];
  }

  static async getResults(feedIds: number[]): Promise<TAnalysisResults> {
    const series: ISeries[] = await Promise.all(feedIds.map(async (id: number): Promise<ISeries> => {
      const covidnetPlugin = await this.fetchCovidnetPluginInstanceFromFeedId(id);
      return await this.fetchResults(covidnetPlugin);
    }));
    
    return {series, classifications: Array.from(series[0].classifications.keys())}
  }

  static async fetchCovidnetPluginInstanceFromFeedId(id: number): Promise<PluginInstance> {
    const client: Client = ChrisAPIClient.getClient();
    const pluginData = await client.getPluginInstances({
      feed_id: id,
      plugin_name: "covidnet"
    });
    return pluginData.getItems()?.[0];
  }

  static async fetchResults(covidnetPlugin: PluginInstance): Promise<ISeries> {
    const file = await covidnetPlugin.getFiles({
      limit: 25,
      offset: 0,
    });
    const files = await file.getItems();
    const predictionFileId = files.filter((file: any) => file.data.fname.replace(/^.*[\\\/]/, '') === "prediction-default.json")?.[0]?.data?.id;
    const prediction = await this.fetchJsonFiles(predictionFileId);
    const severityFileId =  files.filter((file: any) => file.data.fname.replace(/^.*[\\\/]/, '') === "severity.json")?.[0]?.data?.id;
    const severity = await this.fetchJsonFiles(severityFileId);
    const imageFileId =  files.filter((file: any) => file.data.fname.match(/\.[0-9a-z]+$/i)[0] === ".jpg")?.[0]?.data?.id;
    
    let imageUrl: string = "";
    if (imageFileId) {
      const imgBlob = await DicomViewerService.fetchImageFile(imageFileId);
      const urlCreator = window.URL || window.webkitURL;
      imageUrl = urlCreator.createObjectURL(imgBlob);
    }

    const formatNumber = (num: any) => (Math.round(Number(num) * 10000) / 100); // to round to 2 decimal place percentage

    let classifications: Map<string, number> = new Map<string, number>();
    Object.keys(prediction).forEach((key: string) => { // Reading in the classifcation titles and values
      if ((key !== 'prediction') && (key !== "Prediction")) {
        if ((key !== '**DISCLAIMER**') && (!isNaN(prediction[key]))) {
          classifications.set(key, formatNumber(prediction[key]));
        }
      }
    });

    const geographic = {
      severity: severity['Geographic severity'],
      extentScore: severity['Geographic extent score']
    }
    const opacity = {
      severity: severity['Opacity severity'],
      extentScore: severity['Opacity extent score']
    }
  
    return {
        covidnetPluginId: covidnetPlugin.data.id,
        imageName: covidnetPlugin.data.title || "File name not available",
        imageId: imageFileId || "",
        classifications,
        geographic,
        opacity,
        imageUrl: imageUrl || ""
    }
  }

  static async fetchJsonFiles(fileId: string): Promise<{ [field: string]: any }> {
    if (!fileId) {
      return {}
    }

    const client: any = ChrisAPIClient.getClient();

    let file = await client.getFile(fileId);
    let blob = await file.getFileBlob();
    let content = await blob.text();
    return JSON.parse(content);
  }

  static async fetchPacFiles(patientID: any): Promise<DcmImage[]> {
    if (!patientID) return [];

    let client: any = await ChrisAPIClient.getClient();

    const res = await client.getPACSFiles({
      PatientID: patientID,
      limit: 1000
    })
    const patientImages: DcmImage[] = res.getItems().map((img: PACSFile) => img.data);
    return patientImages;
  }

  static async findFilesGeneratedByPlugin(pluginId: number): Promise<any[]> {
    const client: any = ChrisAPIClient.getClient();
    const pluginInstance = await client.getPluginInstances({
      limit: 25,
      offset: 0,
      id: pluginId
    });
    const plugin = pluginInstance.getItems()[0]
    const pluginInstanceFiles = await plugin.getFiles({
      limit: 25,
      offset: 0,
    });
    return pluginInstanceFiles.getItems();
  }

  static async pdfGeneration(selectedImage: selectedImageType) {
    const covidnetPluginId = selectedImage.series?.covidnetPluginId;
    if (covidnetPluginId === null || covidnetPluginId === undefined) return;
    const client: any = ChrisAPIClient.getClient();
    const pluginfiles = await this.findFilesGeneratedByPlugin(covidnetPluginId);
    let imgName: string = '';
    pluginfiles.forEach(file => {
      if (file.data.fname.split('.').pop() === 'jpg') {
        imgName = file.data.fname.split('/').pop()
      }
    })
    if (!imgName) return;
    const pdfgenerationPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.PDFGENERATION })).getItems()[0];
    const pluginData = {
      imagefile: imgName,
      previous_id: covidnetPluginId,
      patientId: selectedImage.dcmImage?.PatientID
    }
    const pdfgeneratorInstance: PluginInstance = await client.createPluginInstance(pdfgenerationPlugin.data.id, pluginData);
    await pollingBackend(pdfgeneratorInstance);

    const files = await this.findFilesGeneratedByPlugin(pdfgeneratorInstance.data.id);
    for (let file of files) {
      if (file.data.fname.includes('.pdf')) {
        let pdf = await client.getFile(file.data.id);
        let pdfBlob = await pdf.getFileBlob();
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${imgName.split('.')[0]}_prediction.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}

export default ChrisIntegration;
