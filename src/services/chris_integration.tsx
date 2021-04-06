import { IPluginCreateData, Note, PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { ISeries, selectedImageType, StudyInstanceWithSeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import DicomViewerService from "../services/dicomViewerService";
import { PluginModels } from "../app.config";
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
  WAITING_FOR_PREVIOUS = "waitingForPrevious",
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
   * Runs pl-dircopy on a DcmImage
   * @param img DcmImage
   * @returns pl-dircopy instance with its corresponding DcmImage
   */
  static async runDircopy(img: DcmImage, timestamp: number): Promise<DircopyResult> {
    let client: any = await ChrisAPIClient.getClient();

    const dircopyPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.FS_PLUGIN })).getItems()[0];
    const data: DirCreateData = { "dir": img.fname, title: img.PatientID };
    const dircopyPluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);
    const feed = await dircopyPluginInstance.getFeed();
    const note = await feed?.getNote();
    await note?.put({
      title: "metadata",
      content: JSON.stringify({
        timestamp,
        img
      })
    })
    console.log("PL-DIRCOPY task sent into the task queue");
    return { instance: dircopyPluginInstance, img };
  }

  /**
   * Runs pl-med2-img and pl-covidnet/pl-ct-covidnet on a DcmImage, given its pl-dircopy instance obtained from runDircopy
   * @param img DcmImage
   * @param dircopyPluginInstance instance obtained from runDircopy
   * @param chosenXrayModel name of model to be used for pl-covidnet
   * @param chosenCTModel name of model to be used for pl-ct-covidnet
   * @returns plugin result after polling
   */
  static async processOneImg(img: DcmImage, dircopyPluginInstance: PluginInstance, chosenXrayModel: string, chosenCTModel: string): Promise<BackendPollResult> {
    let client: any = await ChrisAPIClient.getClient();

    let XRayModel: string = PluginModels.XrayModels[chosenXrayModel]; // Configuring ChRIS to use the correct Xray model
    let CTModel: string = PluginModels.CTModels[chosenCTModel]; // Configuring ChRIS to use the correct CT model

    try {
      console.log(img.fname)

      // PL-MED2IMG
      const imgConverterPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.MED2IMG })).getItems()[0];
      const filename = img.fname.split('/').pop()?.split('.')[0]
      console.log(filename)
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
      const covidnetInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);
      console.log(`${pluginNeeded.toUpperCase()} task sent into the task queue`)

      const covidnetResult = await pollingBackend(covidnetInstance);
      if (covidnetResult.error) {
        return covidnetResult;
      }

      return covidnetResult;
    } catch (err) {
      console.log(err);
      return {
        plugin: 'plugins',
        error: new Error('failed')
      };
    }
  }

  static async getDcmImageDetailByFilePathName(imgTitle: string): Promise<DcmImage[]> {
    const client: any = ChrisAPIClient.getClient();
    return (await client.getPACSFiles({ fname_exact: imgTitle })).data
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
      offset: 0,
    });
    return feeds.getItems()?.[0]?.data?.id;
  }

  /**
   * Returns true if the plugin with the given id is in a terminated state (SUCCESS, ERROR, or CANCELLED)
   * @param {number} id
   */
  static async checkIfPluginTerminated(id: number): Promise<boolean> {
    const client: any = ChrisAPIClient.getClient();
    const plugin = await client.getPluginInstances({ id });
    const status = plugin?.data?.[0]?.status;
    return status === PluginPollStatus.SUCCESS || status === PluginPollStatus.ERROR || status === PluginPollStatus.CANCELLED;
  }

  /**
   * Starting at the provided offset, coninuously fetches Feeds from Swift until able to return an array of
   * StudyInstanceWithSeries of the provided size (limit)
   * @param {number} offset Page offset
   * @param {number} limit Desired number of StudyInstanceWithSeries to receive
   * @param {number} max_id Maximum Feed ID search parameter
   */
  static async getPastAnalyses(offset: number, limit: number, max_id?: number): Promise<[StudyInstanceWithSeries[], number, boolean]> {
    const pastAnalyses: StudyInstanceWithSeries[] = []
    const client: any = ChrisAPIClient.getClient();
    // Indicates when the last Feed on Swift has been reached to prevent further fetching
    let isAtEndOfFeeds = false;

    let curOffset = offset;
    const fetchLimit = 10
    
    while (pastAnalyses.length <= limit && !isAtEndOfFeeds) {
      const feeds = await client.getFeeds({
        limit: fetchLimit,
        offset: curOffset,
        max_id
      });
      curOffset += fetchLimit;

      const feedArray = feeds?.getItems();

      const formattedFeedArray = await Promise.all(feedArray.map(async (feed: any) => {
        const note = await feed.getNote();
        return JSON.parse(note?.data?.content);
      }));

      const groupedFeeds = groupBy(formattedFeedArray, (feed: any) => [feed.timestamp, feed.img.StudyInstanceUID]);

      const newPastAnalyses = Object.values(groupedFeeds).map((study: any): StudyInstanceWithSeries => {
        const firstStudy = study?.[0]
        return {
          dcmImage: firstStudy.img,
          analysisCreated: firstStudy.timestamp,
          series: []
        }
      });
      isAtEndOfFeeds = feedArray?.length < fetchLimit;
  
      pastAnalyses.push(...newPastAnalyses);
    }
    return [pastAnalyses.slice(0,10), curOffset, isAtEndOfFeeds]
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
    const covidnetPluginId = selectedImage.studyInstance?.series[selectedImage.index].covidnetPluginId;
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
      patientId: selectedImage.studyInstance?.dcmImage.PatientID
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
