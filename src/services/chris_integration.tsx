import { IPluginCreateData, PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { ISeries, selectedImageType, StudyInstanceWithSeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import DicomViewerService from "../services/dicomViewerService";
import { PluginModels } from "../api/app.config";
import { formatTime, modifyDatetime } from "../shared/utils"
import { Processing } from '../services/pastAnalysisService';

export interface LocalFile {
  name: string;
  blob: Blob;
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
  SCHEDULED = "scheduled",
  WAITING_FOR_PREVIOUS = "waitingForPrevious",
  WAITING = "waiting",
  STARTED = "started",
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

  static async processOneImg(img: DcmImage, chosenXrayModel: string, chosenCTModel: string): Promise<BackendPollResult> {
    let client: any = await ChrisAPIClient.getClient();

    let XRayModel: string = PluginModels.XrayModels[chosenXrayModel]; // Configuring ChRIS to use the correct Xray model
    let CTModel: string = PluginModels.CTModels[chosenCTModel]; // Configuring ChRIS to use the correct CT model

    try {
      console.log(img.fname)

      // PL-DIRCOPY
      const dircopyPlugin = (await client.getPlugins({ "name_exact": PluginModels.Plugins.FS_PLUGIN })).getItems()[0];
      const data: DirCreateData = { "dir": img.fname };
      const dircopyPluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);
      console.log("PL-DIRCOPY task sent into the task queue")

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
   * Starting at the provided offset, coninuously fetches Feeds from Swift until able to return an array of
   * StudyInstanceWithSeries of the provided size (limit)
   * @param {number} offset Page offset
   * @param {number} limit Desired number of StudyInstanceWithSeries to receive
   * @param {number} max_id Maximum Feed ID search parameter
   */
  static async getPastAnalyses(offset: number, limit: number, max_id?: number): Promise<[StudyInstanceWithSeries[], number, boolean]> {
    const pastAnalysis: StudyInstanceWithSeries[] = [];
    const pastAnalysisMap: { [timeAndStudyUID: string]: { indexInArr: number } } = {}

    const client: any = ChrisAPIClient.getClient();

    // Indicates when the last Feed on Swift has been reached to prevent further fetching
    let isAtEndOfFeeds = false;

    // Aim to have 1 extra StudyInstanceWithSeries to ensure that Feeds associated with the same Study grouping 
    // are not separated across pages. The extra StudyInstanceWithSeries will be discarded at the end
    let fetchLimit = limit + 1;

    let curOffset = offset;

    // Keep fetching Feeds until the desired number of StudyInstanceWithSeries is collected OR the end of Feeds has been reached
    while (pastAnalysis.length < limit + 1 && !isAtEndOfFeeds) {
      const feeds = await client.getFeeds({
        limit: fetchLimit,
        offset: curOffset,
        max_id
      });
      const feedArray = feeds?.getItems();

      curOffset += fetchLimit;

      // If fetch returns less feeds than requested, then the end of the list of Feeds has been reached
      isAtEndOfFeeds = feedArray?.length < fetchLimit;

      for (let feed of feedArray) {
        const pluginInstances = await feed.getPluginInstances({
          limit: 25,
          offset: 0
        });
        // iterate it over all feeds
        const pluginlists = pluginInstances.getItems();
        for (let plugin of pluginlists) {
          let studyInstance: StudyInstanceWithSeries | null = null;
          // ignore plugins that are not models
          if (!isModel(plugin.data.plugin_name)) continue;
          // get dicom image data
          if (plugin.data.title !== '') {
            const imgData: DcmImage[] = await this.getDcmImageDetailByFilePathName(plugin.data.title);
            if (imgData?.length > 0) {
              // use dircopy start time to check
              for (let findDircopy of pluginlists) {
                if (findDircopy.data.plugin_name === PluginModels.Plugins.FS_PLUGIN) {
                  const startedTime = formatTime(findDircopy.data.start_date);
                  const possibileIndex = startedTime + imgData[0].StudyInstanceUID;
                  // already exists so push it to te seriesList
                  if (!!pastAnalysisMap[possibileIndex]) {
                    studyInstance = pastAnalysis[pastAnalysisMap[possibileIndex].indexInArr];
                  } else { // doesn't already exist so we create one
                    const pluginStatus = plugin?.data?.status;
                    let analysisCreated: string;
                    // If the model plugin is not in a terminated state, mark analysisCreated as processing, otherwise, provide datetime
                    if (pluginStatus !== PluginPollStatus.SUCCESS &&
                      pluginStatus !== PluginPollStatus.ERROR &&
                      pluginStatus !== PluginPollStatus.CANCELLED) {
                      analysisCreated = Processing.analysisAreProcessing;
                    } else {
                      analysisCreated = modifyDatetime(findDircopy.data.start_date);
                    }

                    studyInstance = {
                      dcmImage: imgData[0],
                      analysisCreated,
                      series: []
                    };
                    // first update map with the index then push to the result array
                    pastAnalysisMap[possibileIndex] = { indexInArr: pastAnalysis.length };
                    pastAnalysis.push(studyInstance);
                  }
                }
              }
            }
          } else {
            // TODO: investigate else case
            return [[], curOffset, isAtEndOfFeeds];
          }

          const pluginInstanceFiles = await plugin.getFiles({
            limit: 25,
            offset: 0,
          });
          const newSeries: ISeries = {
            covidnetPluginId: plugin.data.id,
            imageName: "",
            imageId: "",
            classifications: new Map<string, number>(),
            geographic: null,
            opacity: null,
            imageUrl: "",
          };

          if (plugin.data?.status === "cancelled" || !pluginInstanceFiles.getItems()) {
            newSeries.imageName = plugin.data?.title ? plugin.data?.title : "N/A";
          } else {
            for (let fileObj of pluginInstanceFiles.getItems()) {
              if (fileObj.data.fname.includes("prediction") && fileObj.data.fname.includes("json")) {
                let content = await this.fetchJsonFiles(fileObj.data.id);
                const formatNumber = (num: any) => (Math.round(Number(num) * 10000) / 100); // to round to 2 decimal place percentage
                Object.keys(content).forEach((key: string) => { // Reading in the classifcation titles and values
                  if ((key !== 'prediction') && (key !== "Prediction")) {
                    if ((key !== '**DISCLAIMER**') && (!isNaN(content[key]))) {
                      newSeries.classifications.set(key, formatNumber(content[key]));
                    }
                  }
                });
              } else if (fileObj.data.fname.includes('severity.json')) {
                let content = await this.fetchJsonFiles(fileObj.data.id)
                newSeries.geographic = {
                  severity: content['Geographic severity'],
                  extentScore: content['Geographic extent score']
                }
                newSeries.opacity = {
                  severity: content['Opacity severity'],
                  extentScore: content['Opacity extent score']
                }
              } else if (!fileObj.data.fname.includes('json')) {
                newSeries.imageId = fileObj.data.id;

                // Fetch image URL
                if (newSeries.imageId) {
                  const imgBlob = await DicomViewerService.fetchImageFile(newSeries.imageId);
                  const urlCreator = window.URL || window.webkitURL;
                  newSeries.imageUrl = urlCreator.createObjectURL(imgBlob);
                }

                // get dcmImageId from dircopy
                const dircopyPlugin = pluginlists[pluginlists.findIndex((plugin: any) => plugin.data.plugin_name === PluginModels.Plugins.FS_PLUGIN)]
                const dircopyFiles = (await dircopyPlugin.getFiles({
                  limit: 100,
                  offset: 0
                })).data;
                const dcmImageFile = dircopyFiles[dircopyFiles.findIndex((file: any) => file.fname.includes('.dcm'))]
                newSeries.imageName = dcmImageFile.fname;
              }
            }
          }

          if (studyInstance) studyInstance.series.push(newSeries);
        }
      }

      // Update fetchLimit to be remaining number of StudyInstanceWithSeries desired
      fetchLimit = limit + 1 - pastAnalysis.length;
    }

    // If the end of Feeds was reached, return all collected StudyInstanceWithSeries, otherwise, discard the last extra Study
    const pastAnalysesToReturn = isAtEndOfFeeds ? pastAnalysis : pastAnalysis.slice(0, -1);

    return [pastAnalysesToReturn, curOffset - 1, isAtEndOfFeeds];
  }

  static async fetchJsonFiles(fileId: string): Promise<{ [field: string]: any }> {
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
