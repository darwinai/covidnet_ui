import ChrisAPIClient from "../api/chrisapiclient"
import { Plugin, PluginInstance, IPluginsSearchParams, IPluginCreateData } from "@fnndsc/chrisapi";
import { LocalFile } from "./chris_integration";


// export interface IPluginCreateData {
//   title?: string,
//   previous_id?: string,
//   cpu_limit?: string,
//   memory_limit?: string,
//   number_of_workers?: string,
//   gpu_limit?: string
// }

interface DirCreateData extends IPluginCreateData {
  dir: string;
}

interface PlcovidnetData extends IPluginCreateData {
  imagefile: string;
}

export const pollingBackend = async (pluginInstance: PluginInstance) =>{
  const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  while (true) {
    await timeout(1000)
    const res: any = await pluginInstance.get()
    console.log(res.data.status)
    if (res.data.status === "finishedSuccessfully") {
      console.log('reached')
      break;
    }
  }
}

export const uploadTest = async (files: LocalFile[]): Promise<void> => {
  let client:any = await ChrisAPIClient.getClient();

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
  console.log(filename)
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

  // get output files
  const pluginFilesList: any = await covidnetInstance.getFiles({
    limit: 25,
    offset: 0,
  })
  console.log(pluginFilesList.data)
  for (let fileObj of pluginFilesList.data){
    let file = await client.getFile(fileObj.id)
    let blob = await file.getFileBlob()
    let content = await blob.text();
    // if json
    let filename = fileObj.fname
    filename = filename.split('/').pop().split('.').pop()
    if (filename == 'json'){
      console.log(JSON.parse(content))
    } else {
      console.log(content)
    }
  }

}

// const uploadedFile = await client.uploadFile({"upload_path": "cube/uploads/<file_name>"}, {"fname": <file_blob>});
// const plugins = await client.getPlugins({"name_exact": "dircopy"});
// const dircopyPlugin = plugins.getItems()[0]
// const data = {"dir": uploadedFile.fname}
// const pluginInstance = await client.createPluginInstance(dircopyPlugin.id, data);

export const testAnalysis = async () => {
  // const client = ChrisAPIClient.getClient();
  // let page = 1;
  // const feeds = await client.getFeeds({
  //   limit: 25,
  //   offset: page * 25,
  // });
  // console.log(feeds)
  // const feedArray = feeds.getItems();
  // // there are no feeds so currently empty array
  // console.log(feedArray)
  // const pluginId = 1; // assuming that the plugin with id 1 is 'simplefsapp'
  // const data = {
  //   //previous_id: null,  // instances of 'fs' plugins have previous_id set to null
  //   title: "Test plugin instance",
  //   dir: "chris/uploads/cube/"
  // };
  // let resp = client.createPluginInstance(pluginId, data);
  // resp
  //   .then((plgInstResObj: PluginInstance) => {
  //     console.log('New plugin instance: ', plgInstResObj);

  //   })
  //   .catch(error => {
  //     console.log('Something went wrong with this request!!!: ', error);
  //   });
  // const searchdata: IPluginsSearchParams = {
  //   title: "",
  //   limit:100
  // }
  // let result = await client.getPlugins(searchdata)
  // console.log(result)
}