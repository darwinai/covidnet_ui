import ChrisAPIClient from "../api/chrisapiclient"
import { IAnalysis } from "../context/reducers/analyseReducer";
import { PluginInstance, IPluginCreateData } from "@fnndsc/chrisapi";

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
  const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  while (true) {
    await timeout(1000)
    const res: any = await pluginInstance.get()
    console.log(res.data.status)
    if (res.data.status === "finishedSuccessfully") {
      break;
    }
  }
}

export const modifyDatetime = (oldDay: string): string => {
  let today = new Date().setHours(0, 0, 0, 0)
  let diff = Math.abs(+today - +new Date(oldDay.split('T')[0]))
  diff = Math.floor(diff / (1000 * 60 * 60 * 24)) // diff is in days
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

  private static PL_COVIDNET = "pl_covidnet";

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
      }, {
        "fname": files[0].blob
      })

      // create dircopy plugin
      const plugins = await client.getPlugins({ "name_exact": "dircopy" });
      const dircopyPlugin = plugins.getItems()[0]
      const data: DirCreateData = { "dir": uploadedFile.data.fname }
      const pluginInstance: PluginInstance = await client.createPluginInstance(dircopyPlugin.data.id, data);

      await pollingBackend(pluginInstance)

      let filename = uploadedFile.data.fname.split('/')
      filename = filename.pop()
      // create covidnet plugin
      const plcovidnet_data: PlcovidnetData = {
        previous_id: pluginInstance.data.id,
        title: "pl_covidnet",
        imagefile: filename
      }
      const plcovidnet = await client.getPlugins({ "name_exact": "pl-covidnet" })
      const covidnetPlugin = plcovidnet.getItems()[0]
      const covidnetInstance: PluginInstance = await client.createPluginInstance(covidnetPlugin.data.id, plcovidnet_data);

      await pollingBackend(covidnetInstance)
    } catch (err) {
      return false
    }
    return true;
  }

  static async getPastAnalaysis(page: number, perpage: number) {
    let pastAnalyses: IAnalysis[] = []

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
        const analysis: IAnalysis = {
          image: '',
          // patientMRN: 0,
          createdTime: '',
          study: '',
          predCovid: 0,
          predPneumonia: 0,
          predNormal: 0
        }

        // ignore plugins that are not pl_covidnet
        if (plugin.data.title !== this.PL_COVIDNET) {
          continue;
        }
        analysis.createdTime = modifyDatetime(plugin.data.start_date)
        const pluginInstanceFiles = await plugin.getFiles({
          limit: 25,
          offset: page * perpage,
        });
        for (let fileObj of pluginInstanceFiles.getItems()) {
          if (fileObj.data.fname.includes('prediction') && fileObj.data.fname.includes('json')) {
            let file = await client.getFile(fileObj.data.id);
            let blob = await file.getFileBlob();
            let content = await blob.text();
            const formatNumber = (num: any) => (Math.round(Number(num) * 10000) / 100) // to round to 2 decimal place percentage
            content = JSON.parse(content)
            analysis.predCovid = formatNumber(content['COVID-19'])
            analysis.predNormal = formatNumber(content['Normal'])
            analysis.predPneumonia = formatNumber(content['Pneumonia'])
            // pastAnalyses.append(content)
          } else if (!fileObj.data.fname.includes('json')) {
            // picture file
            let filename = fileObj.data.fname.split('/').pop();
            analysis.image = filename
          }
        }
        if (pluginInstanceFiles.getItems().length > 0)
          pastAnalyses.push(analysis);
      }
    }
    return pastAnalyses;
  }
}

export default ChrisIntegration;