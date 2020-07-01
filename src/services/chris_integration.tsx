import ChrisAPIClient from "../api/chrisapiclient"
import { StudyInstanceWithSeries, ISeries } from "../context/reducers/analyseReducer";
import { PluginInstance, IPluginCreateData } from "@fnndsc/chrisapi";
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


export const pollingBackend = async (pluginInstance: PluginInstance) => {
  let waitTime = 1000;
  const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  while (true) {
    await timeout(waitTime)
    const res: any = await pluginInstance.get()
    console.log(`${res.data.plugin_name}: ${res.data.status}`)
    if (res.data.status === "finishedSuccessfully") {
      break;
    }
    waitTime *= 2;
  }
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

  static async getTotalAnalyses(): Promise<number> {
    let client: any = await ChrisAPIClient.getClient();
    const feeds = await client.getFeeds({
      limit: 25,
      offset: 0,
    });
    let count = 0;
    for (let feed of feeds.getItems()) {
      if (feed.data.finished_jobs >= 2)
        count++;
    }
    return count;
  }

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

  static async processOneImg(img: DcmImage) {
    let client: any = await ChrisAPIClient.getClient();
    try {
      const dircopyPlugin = (await client.getPlugins({ "name_exact": this.FS_PLUGIN })).getItems()[0];
      // const params = await dircopyPlugin.getPluginParameters();
      const data: DirCreateData = { "dir": img.fname };
      const dircopyPluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);

      await pollingBackend(dircopyPluginInstance)

      //med2img
      const imgConverterPlugin = (await client.getPlugins({ "name_exact": this.MED2IMG })).getItems()[0];
      const filename = img.fname.split('/').pop()?.split('.')[0]
      console.log(filename)
      const imgData = {
        inputFile: img.fname.split('/').pop(),
        outputFileStem: `${filename}.jpg`, //-slice000
        previous_id: dircopyPluginInstance.data.id
      }
      console.log(imgData)
      const imgConverterInstance: PluginInstance = await client.createPluginInstance(imgConverterPlugin.data.id, imgData);
      console.log("Converter Running")
      await pollingBackend(imgConverterInstance)

      const covidnetPlugin = (await client.getPlugins({ "name_exact": this.PL_COVIDNET })).getItems()[0];
      const plcovidnet_data: PlcovidnetData = {
        previous_id: imgConverterInstance.data.id,
        title: img.fname,
        imagefile: `${filename}-slice000.jpg`
      }
      const covidnetInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);

      console.log("Covidnet Running")
      await pollingBackend(covidnetInstance)
    } catch (err) {
      console.log(err);
      return;
    }
  }

  static async getPastAnalaysis(page: number, perpage: number): Promise<StudyInstanceWithSeries[]> {
    const pastAnalysis: StudyInstanceWithSeries[] = [];
    const pastAnalysisMap: { [time: number]: { studyUID: string, indexInArr: number } } = {}

    // since we want to have offset = 0 for page 1
    --page;
    const client: any = ChrisAPIClient.getClient();
    const feeds = await client.getFeeds({
      limit: 25,
      offset: page * perpage,
    });
    const feedArray = feeds.getItems();
    for (let feed of feedArray) {
      const pluginInstances = await feed.getPluginInstances({
        limit: 25,
        offset: page * perpage,
      });
      // iterate it over all feeds
      const pluginlists = pluginInstances.getItems()
      for (let plugin of pluginlists) {
        let studyInstance: StudyInstanceWithSeries | null = null

        // ignore plugins that are not pl_covidnet
        if (plugin.data.plugin_name !== this.PL_COVIDNET) continue;

        // get dicom image data
        if (plugin.data.title !== '') {
          const imgDatas: DcmImage[] = (await client.getPACSFiles({ fname_exact: plugin.data.title })).data;
          if (imgDatas.length > 0) {
            // use dircopy start time to check
            for (let findDircopy of pluginlists) {
              if (findDircopy.data.plugin_name === this.FS_PLUGIN) {
                const startedTimeInSeconds = Math.floor((new Date(plugin.data.start_date)).getTime() / 1000);
                // already exists so push it to te seriesList
                if (!!pastAnalysisMap[startedTimeInSeconds]
                  && pastAnalysisMap[startedTimeInSeconds].studyUID === imgDatas[0].StudyInstanceUID) {
                  studyInstance = pastAnalysis[pastAnalysisMap[startedTimeInSeconds].indexInArr]
                } else { // doesn't already exist so we create one
                  studyInstance = {
                    studyDescription: imgDatas[0].StudyDescription,
                    patientMRN: imgDatas[0].PatientID,
                    patientDOB: imgDatas[0].PatientBirthDate,
                    patientAge: imgDatas[0].PatientAge,
                    analysisCreated: modifyDatetime(imgDatas[0].creation_date),
                    series: []
                  }
                  // first update map with the index then push to the result array
                  pastAnalysisMap[startedTimeInSeconds] = { studyUID: imgDatas[0].StudyInstanceUID, indexInArr: pastAnalysis.length };
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
          offset: page * perpage,
        });
        const newSeries: ISeries = {
          imageName: '',
          imageId: '',
          predCovid: 0,
          predPneumonia: 0,
          predNormal: 0,
          geographic: null,
          opacity: null
        }
        for (let fileObj of pluginInstanceFiles.getItems()) {
          if (fileObj.data.fname.includes('prediction') && fileObj.data.fname.includes('json')) {
            let file = await client.getFile(fileObj.data.id);
            let blob = await file.getFileBlob();
            let content = await blob.text();
            const formatNumber = (num: any) => (Math.round(Number(num) * 10000) / 100) // to round to 2 decimal place percentage
            content = JSON.parse(content)
            newSeries.predCovid = formatNumber(content['COVID-19'])
            newSeries.predNormal = formatNumber(content['Normal'])
            newSeries.predPneumonia = formatNumber(content['Pneumonia'])
          } else if (fileObj.data.fname === 'severity.json') {
            let file = await client.getFile(fileObj.data.id);
            let blob = await file.getFileBlob();
            let content = await blob.text();
            newSeries.geographic = {
              severity: content['Geographic severity'],
              extentScore: content['Geographic extent score']
            }
            newSeries.opacity = {
              severity: content['Opacity severity'],
              extentScore: content['Opacity extent score']
            }
          } else if (!fileObj.data.fname.includes('json')) {
            // picture file
            newSeries.imageId = fileObj.data.id;

            // get dcmImageId from dircopy
            const dircopyPlugin = pluginlists[pluginlists.findIndex((plugin: any) => plugin.data.plugin_name === this.FS_PLUGIN)]
            const dircopyFiles = (await dircopyPlugin.getFiles({
              limit: 25,
              offset: page * perpage,
            })).data;
            const dcmImageFile = dircopyFiles[dircopyFiles.findIndex((file: any) => !file.fname.includes('.json'))]
            newSeries.imageName = dcmImageFile.fname;
          }
        }
        if (studyInstance) studyInstance.series.push(newSeries)
      }
    }
    return pastAnalysis;
  }

  static async fetchPacFiles(patientID: any): Promise<DcmImage[]> {
    let client: any = await ChrisAPIClient.getClient();

    const res = await client.getPACSFiles({
      PatientID: patientID
    })
    const patientImages: DcmImage[] = res.getItems().map((img: any) => img.data)
    return patientImages;
  }
}

export default ChrisIntegration;