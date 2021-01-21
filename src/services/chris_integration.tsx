import { IPluginCreateData, PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { ISeries, selectedImageType, StudyInstanceWithSeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";

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

enum PluginPollStatus {
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

export const formatTime = (oldDay: string): string => {
  return oldDay.split('.')[0]
}

export const modifyDatetime = (oldDay: string): string => {
  let today = new Date().setHours(0, 0, 0, 0)
  let diff = Math.abs(+today - +new Date(oldDay.split('T')[0]))
  diff = Math.floor(diff / (1000 * 60 * 60 * 24)) // diff is in days, 1ms * 1000 * 60 * 60 * 24
  let description = "days ago"
  let rvtVal = `${diff} ${description}`
  if (diff / 30 >= 1) {
    description = diff / 30 >= 2 ? "months ago" : "month ago"
    diff = Math.floor((diff / 30))
    rvtVal = `${diff} ${description}`
  } else if (diff / 7 >= 1) {
    description = diff / 7 >= 2 ? "weeks ago" : "week ago"
    diff = Math.floor(diff / 7)
    rvtVal = `${diff} ${description}`
  } else if (diff < 1) {
    rvtVal = oldDay.split('T')[1].split('.')[0]
  }
  return rvtVal
}

class ChrisIntegration {

  private static PL_COVIDNET = 'pl-covidnet';
  private static FS_PLUGIN = 'pl-dircopy'; // 'pl-dircopy';
  private static MED2IMG = 'pl-med2img';
  private static PL_CT_COVIDNET = 'pl-ct-covidnet';
  private static PL_PDFGENERATION = 'pl-pdfgeneration';

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
      const dircopyPlugin = (await client.getPlugins({ 'name_exact': this.FS_PLUGIN })).getItems()[0];
      const data: DirCreateData = { "dir": uploadedFile.data.fname }
      const pluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);

      await pollingBackend(pluginInstance)

      const filename = uploadedFile.data.fname.split('/').pop()
      // create covidnet plugin
      const plcovidnet_data: PlcovidnetData = {
        previous_id: pluginInstance.data.id,
        // title: this.PL_COVIDNET,
        imagefile: filename
      }
      const plcovidnet = await client.getPlugins({ "name_exact": "pl-covidnet" })
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

  static async processOneImg(img: DcmImage): Promise<BackendPollResult[]> {
    let client: any = await ChrisAPIClient.getClient();
    try {
      console.log(img.fname)
      const dircopyPlugin = (await client.getPlugins({ "name_exact": this.FS_PLUGIN })).getItems()[0];
      // const params = await dircopyPlugin.getPluginParameters();
      const data: DirCreateData = { "dir": img.fname };
      const dircopyPluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);

      const dirCopyResult = await pollingBackend(dircopyPluginInstance);
      if (dirCopyResult.error) {
        return [dirCopyResult];
      }

      //med2img
      const imgConverterPlugin = (await client.getPlugins({ "name_exact": this.MED2IMG })).getItems()[0];
      const filename = img.fname.split('/').pop()?.split('.')[0]
      console.log(filename)
      const imgData = {
        inputFile: img.fname.split('/').pop(),
        sliceToConvert: 0,
        outputFileStem: `${filename}.jpg`, //-slice000
        previous_id: dircopyPluginInstance.data.id
      }
      if (imgConverterPlugin === undefined || imgConverterPlugin.data === undefined) {
        return [{
          plugin: this.MED2IMG,
          error: new Error('not registered')
        }];
      }
      const imgConverterInstance: PluginInstance = await client.createPluginInstance(imgConverterPlugin.data.id, imgData);
      console.log("Converter Running")
      const imgConverterResult = await pollingBackend(imgConverterInstance);
      if (imgConverterResult.error) {
        return [imgConverterResult];
      }

      const pluginNeeded = img.Modality === 'CR' ? this.PL_COVIDNET : this.PL_CT_COVIDNET;
      const covidnetPlugin = (await client.getPlugins({ "name_exact": pluginNeeded })).getItems()[0];
      const plcovidnet_data: PlcovidnetData = {
        previous_id: imgConverterInstance.data.id,
        title: img.fname,
        imagefile: `${filename}.jpg`
      }
      if (covidnetPlugin === undefined || covidnetPlugin.data === undefined) {
        return [{
          plugin: pluginNeeded,
          error: new Error('not registered')
        }];
      }
      const covidnetInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);
      console.log("Covidnet Running");
      const covidnetResult = await pollingBackend(covidnetInstance);
      if (covidnetResult.error) {
        return [covidnetResult];
      }

      return [dirCopyResult, imgConverterResult, covidnetResult];
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  static async getDcmImageDetailByFilePathName(imgTitle: string): Promise<DcmImage[]> {
    const client: any = ChrisAPIClient.getClient();
    return (await client.getPACSFiles({ fname_exact: imgTitle })).data
  }

  static async getPastAnalaysis(page: number, perpage: number): Promise<StudyInstanceWithSeries[]> {
    const pastAnalysis: StudyInstanceWithSeries[] = [];
    const pastAnalysisMap: { [timeAndStudyUID: string]: { indexInArr: number } } = {}

    // since we want to have offset = 0 for page 1
    --page;
    const client: any = ChrisAPIClient.getClient();
    const feeds = await client.getFeeds({
      limit: perpage,
      offset: page * perpage,
    });
    const feedArray = feeds.getItems();
    for (let feed of feedArray) {
      const pluginInstances = await feed.getPluginInstances({
        limit: 25,
        offset: 0
      });
      // iterate it over all feeds
      const pluginlists = pluginInstances.getItems()
      for (let plugin of pluginlists) {
        let studyInstance: StudyInstanceWithSeries | null = null
        // ignore plugins that are not pl-covidnet or pl-ct-covidnet
        if (plugin.data.plugin_name !== this.PL_COVIDNET && plugin.data.plugin_name !== this.PL_CT_COVIDNET) continue; //xray + chest

        // get dicom image data
        if (plugin.data.title !== '') {
          const imgDatas: DcmImage[] = await this.getDcmImageDetailByFilePathName(plugin.data.title);
          if (imgDatas.length > 0) {
            // use dircopy start time to check
            for (let findDircopy of pluginlists) {
              if (findDircopy.data.plugin_name === this.FS_PLUGIN) {
                const startedTime = formatTime(findDircopy.data.start_date);
                const possibileIndex = startedTime + imgDatas[0].StudyInstanceUID;
                // already exists so push it to te seriesList
                if (!!pastAnalysisMap[possibileIndex]) {
                  studyInstance = pastAnalysis[pastAnalysisMap[possibileIndex].indexInArr]
                } else { // doesn't already exist so we create one
                  studyInstance = {
                    dcmImage: imgDatas[0],
                    analysisCreated: modifyDatetime(findDircopy.data.start_date),
                    series: []
                  }
                  // first update map with the index then push to the result array
                  pastAnalysisMap[possibileIndex] = { indexInArr: pastAnalysis.length };
                  pastAnalysis.push(studyInstance)
                }
              }
            }
          }
        } else {
          return [];
        }

        const pluginInstanceFiles = await plugin.getFiles({
          limit: 25,
          offset: 0,
        });
        const newSeries: ISeries = {
          covidnetPluginId: plugin.data.id,
          imageName: '',
          imageId: '',
          columnNames: [],
          columnValues: [],
          geographic: null,
          opacity: null
        }

        for (let fileObj of pluginInstanceFiles.getItems()) {
          //console.log(fileObj.data.fname)
          if (fileObj.data.fname.includes('prediction') && fileObj.data.fname.includes('json')) {
            let content = await this.fetchJsonFiles(fileObj.data.id)
            console.log(fileObj.data.fname)
            const formatNumber = (num: any) => (Math.round(Number(num) * 10000) / 100) // to round to 2 decimal place percentage
            console.log(content); //LOOK AT FILE CONTENTS HERE.
            Object.keys(content).map(function(key: string) {
              if (key !== 'prediction') {
                if (key !== '**DISCLAIMER**') { //why was this disclaimer? it wasn't even in the file. check with janakitti's and original to see if orders are pairing correctly. compare with the json file that i can print out too.
                  newSeries.columnNames.push(key);
                  newSeries.columnValues.push(formatNumber(content[key]));
                }
              } return 1;
            });

          } else if (fileObj.data.fname.includes('severity.json')) {
            let content = await this.fetchJsonFiles(fileObj.data.id)
            console.log(content)
            newSeries.geographic = {
              severity: content['Geographic severity'],
              extentScore: content['Geographic extent score']
            }
            newSeries.opacity = {
              severity: content['Opacity severity'],
              extentScore: content['Opacity extent score']
            }
          } else if (!fileObj.data.fname.includes('json')) { // fetch image
            newSeries.imageId = fileObj.data.id;

            // get dcmImageId from dircopy
            const dircopyPlugin = pluginlists[pluginlists.findIndex((plugin: any) => plugin.data.plugin_name === this.FS_PLUGIN)]
            const dircopyFiles = (await dircopyPlugin.getFiles({
              limit: 100,
              offset: 0
            })).data;
            const dcmImageFile = dircopyFiles[dircopyFiles.findIndex((file: any) => file.fname.includes('.dcm'))]
            newSeries.imageName = dcmImageFile.fname;
            // newSeries.imageId = dcmImageFile.id;
          }
        }
        if (studyInstance) studyInstance.series.push(newSeries)
      }
    }
    return pastAnalysis;
  }

  static async fetchJsonFiles(fileId: string): Promise<{ [field: string]: any }> {
    const client: any = ChrisAPIClient.getClient();

    let file = await client.getFile(fileId);
    let blob = await file.getFileBlob();
    let content = await blob.text();
    console.log(content)
    return JSON.parse(content);
  }

  static async fetchPacFiles(patientID: any): Promise<DcmImage[]> {
    let client: any = await ChrisAPIClient.getClient();

    const res = await client.getPACSFiles({
      PatientID: patientID,
      limit: 1000
    })
    const patientImages: DcmImage[] = res.getItems().map((img: any) => img.data)
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
    if (covidnetPluginId ===  null || covidnetPluginId ===  undefined) return;
    const client: any = ChrisAPIClient.getClient();
    const pluginfiles = await this.findFilesGeneratedByPlugin(covidnetPluginId);
    let imgName: string = '';
    pluginfiles.forEach(file => {
      if (file.data.fname.split('.').pop() === 'jpg') {
        imgName = file.data.fname.split('/').pop()
      }
    })
    if (!imgName) return;
    const pdfgenerationPlugin = (await client.getPlugins({ "name_exact": this.PL_PDFGENERATION })).getItems()[0];
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