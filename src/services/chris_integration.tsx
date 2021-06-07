import Client, { IPluginCreateData, Note, FeedPluginInstanceList, PluginInstance, PluginInstanceFileList, Feed, FeedList } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { ISeries, selectedImageType, TStudyInstance, TPluginStatuses } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import DicomViewerService from "../services/dicomViewerService";
import { PluginModels, FEED_NOTE_TITLE, BASE_COVIDNET_MODEL_PLUGIN_NAME } from "../app.config";
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
  img: DcmImage,
  mostRecentPluginName: string
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

export enum PluginPollStatus {
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
  title: string;
  status: string;
  pluginName: string;
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
   * Initiate pl-dircopy, pl-med2img, and the appropriate COVID-Net plugin in sequence on the provided DcmImage
   * @param {DcmImage} img - The DICOM data to run the analysis on
   * @param {string} chosenXrayModel - The name of the COVID-Net model to use on the x-ray images
   * @param {string} chosenCTModel - The name of the COVID-Net model to use on the CT images
   * @returns {BackendPollResult} The result of initiating the plugins
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
          img,
          mostRecentPluginName: PluginModels.Plugins.FS_PLUGIN
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
      const modelPluginInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);
      console.log(`${pluginNeeded.toUpperCase()} task sent into the task queue`)
      const modelFeed = await modelPluginInstance.getFeed();
      const modelNote = await modelFeed?.getNote();
      await modelNote?.put({
        title: FEED_NOTE_TITLE,
        content: JSON.stringify({
          timestamp,
          img,
          mostRecentPluginName: pluginNeeded
        })
      })
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

  /**
   * Gets the header data for a given DICOM filepath
   * @param {string} filepath - Filepath for the DICOM on Swift
   * @returns {Promise<DcmImage>} DICOM header data
   */
  static async getDcmImageDetailByFilePathName(filepath: string): Promise<DcmImage> {
    const client: any = ChrisAPIClient.getClient();
    const files = await client.getPACSFiles({ fname_exact: filepath })
    return files?.data?.[0];
  }

  /**
   * Gets the filepath to a DICOM given its Study and Series UIDs
   * @param {string} StudyInstanceUID - DICOM StudyInstanceUID
   * @param {string} SeriesInstanceUID - DICOM SeriesInstanceUID
   * @returns {Promise<string>} Filepath to DICOM
   */
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
   * Gets the ID of the most recent Feed in ChRIS
   * @returns {Promise<number>} Feed ID
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
   * Returns true if the all the jobs associated with the Feed ID are either finished, errored, or cancelled
   * @param {number} id - Feed ID
   * @returns {Promise<boolean>} True of all Feed jobs are completed
   */
  static async checkIfFeedJobsCompleted(id: number): Promise<boolean> {
    const client: Client = ChrisAPIClient.getClient();
    const feed: Feed = await client.getFeed(id);
    const feedData = feed?.data;
    const jobsRunning = feedData?.created_jobs +
                        feedData?.registering_jobs +
                        feedData?.scheduled_jobs +
                        feedData?.started_jobs +
                        feedData?.waiting_jobs;
    return jobsRunning === 0;
  }

  /**
   * Gets title, status, and plugin name for the covidnet plugin associated with given Feed ID
   * @param {number} id - Feed ID
   * @returns {Promise<pluginData>} Plugin data
   */
  static async getCovidnetPluginData(feedId: number): Promise<pluginData> {
    const client: Client = ChrisAPIClient.getClient();
    const plugin = await client.getPluginInstances({
      feed_id: feedId,
      plugin_name: BASE_COVIDNET_MODEL_PLUGIN_NAME
    });
    return ({
      title: plugin?.getItems()?.[0]?.data?.title,
      status: plugin?.getItems()?.[0]?.data?.status,
      pluginName: plugin?.getItems()?.[0]?.data?.plugin_name
    });
  }

  /**
   * Starting at the provided offset, coninuously fetches Feeds from Swift until able to return an array of
   * TStudyInstance of the provided size (limit)
   * @param {number} offset Page offset
   * @param {number} limit Desired number of TStudyInstance to receive
   * @param {number} max_id Maximum Feed ID search parameter
   */
  static async getPastAnalyses(offset: number, limit: number, filter: string, max_id?: number): Promise<[TStudyInstance[], number, boolean]> {
    const client: any = ChrisAPIClient.getClient();

    // Indicates when the last Feed on Swift has been reached to prevent further fetching
    let isAtEndOfFeeds = false;

    let curOffset = offset;
    const fetchLimit = limit;

    // Feed and Note data that have been fetched so far
    const feedNoteArray: TFeedNote[] = [];

    // Feeds grouped by [timestamp, StudyInstanceUID]
    let studyGroups: Object = {};

    // Keep fetching Feeds in batch sizes of "limit" and grouping them until studyGroups contains ("limit" + 1) number of groups
    while (Object.keys(studyGroups).length <= limit && !isAtEndOfFeeds) {
      const feeds: FeedList = await client.getFeeds({
        limit: limit,
        offset: curOffset,
        name: filter,
        max_id
      });

      curOffset += limit;
      
      const feedArray: Feed[] = feeds?.getItems();

      // If the number of Feeds in the response was less than fetchLimit, it means that the end of Feeds in the DB has been reached
      isAtEndOfFeeds = feedArray?.length < limit;

      // Get Note data and pair it with the respective Feed
      const newFeedNoteArray: TFeedNote[] = (await Promise.all(feedArray.map(async (feed: Feed): Promise<TFeedNote[]> => {
        const note: Note = await feed.getNote();
        if (!note || note.data.title !== FEED_NOTE_TITLE) {
          return [];
        }
        const noteContent = JSON.parse(note?.data?.content);
        return [{
          feed,
          note: noteContent
        }];
      }))).flat();

      feedNoteArray.push(...newFeedNoteArray);

      // Group Feeds into an object by [timestamp, StudyInstanceUID]. Each group represents a row on the table.
      studyGroups = groupBy(feedNoteArray, (feedNote: TFeedNote) => [feedNote.note.timestamp, feedNote.note.img.StudyInstanceUID]);
    }

    // If the end of Feeds was reached and the number of groups doesn't exceed the desired limit, mark this is as the last page to be fetched
    // This flag will prevent the table from allowing the click the Next button
    const isLastPage = isAtEndOfFeeds && Object.keys(studyGroups).length <= limit;

    // Generate list of TStudyInstance
    const pastAnalyses: TStudyInstance[] = Object.values(studyGroups).map((feedNotes: TFeedNote[]): TStudyInstance => {
      const firstFeedNote = feedNotes?.[0];

      const pluginStatuses = feedNotes.reduce((acc: TPluginStatuses, cur: TFeedNote) => {
        const feedData = cur.feed.data;
        acc.jobsDone += feedData.finished_jobs
        acc.jobsErrored += feedData.errored_jobs + feedData.cancelled_jobs
	      acc.jobsRunning += feedData.created_jobs +
                           feedData.registering_jobs +
                           feedData.scheduled_jobs +
                           feedData.started_jobs +
                           feedData.waiting_jobs;
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
        pluginStatuses
      }
    });

    // Discard the extra analysis, if there is one
    const pastAnalysesSliced = pastAnalyses.slice(0, limit);

    // Count the number of Feeds that are actually being used for this page and add to the initial offset
    const lastOffset = offset + pastAnalysesSliced.reduce((acc: number, cur: TStudyInstance) => {
      return acc + cur.feedIds.length;
    }, 0);

    return [pastAnalysesSliced, lastOffset, isLastPage];
  }

  /**
   * Gets the list of Series results, along with a list of the names for the classes used to title the columns of the SeriesTable
   * @param {number[]} feedIds List of Feed IDs
   * @return {Promise<TAnalysisResults>} Results from analysis
   */
  static async getResultsAndClassesFromFeedIds(feedIds: number[]): Promise<TAnalysisResults> {
    const series: ISeries[] = await Promise.all(feedIds.map(async (id: number): Promise<ISeries> => {
      const covidnetPlugin = await this.getCovidnetPluginInstanceFromFeedId(id);
      return await this.getCovidnetResults(covidnetPlugin);
    }));
    
    return {series, classifications: Array.from(series?.[0]?.classifications.keys())}
  }

  /**
   * Gets covidnet plugin instance that belongs to the given Feed
   * @param {number} feedId Feed ID
   * @return {Promise<PluginInstance>} covidnet plugin instance
   */
  static async getCovidnetPluginInstanceFromFeedId(feedId: number): Promise<PluginInstance> {
    const client: Client = ChrisAPIClient.getClient();
    const pluginData = await client.getPluginInstances({
      feed_id: feedId,
      plugin_name: BASE_COVIDNET_MODEL_PLUGIN_NAME
    });
    return pluginData.getItems()?.[0];
  }

  /**
   * Gets results generated from the covidnet plugin
   * @param {PluginInstance} covidnetPlugin covidnet plugin instance
   * @return {Promise<ISeries>} Results
   */
  static async getCovidnetResults(covidnetPlugin: PluginInstance): Promise<ISeries> {
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

  // static async fetchPluginInstanceFromId(id: number): Promise<PluginInstance> {
  //   const client: Client = ChrisAPIClient.getClient();
  //   const pluginData = await client.getPluginInstances({ id });
  //   return pluginData.getItems()?.[0];
  // }

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
      offset: 0
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
    const feed = await pdfgeneratorInstance.getFeed();
    const note = await feed?.getNote();
    const noteContent: TFeedNoteContent = JSON.parse(note?.data?.content || "") as TFeedNoteContent;
    await note?.put({
      title: FEED_NOTE_TITLE,
      content: JSON.stringify({
        timestamp: noteContent.timestamp,
        img: noteContent.img,
        mostRecentPluginName: PluginModels.Plugins.PDFGENERATION
      })
    })
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
