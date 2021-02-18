import { IPluginCreateData, PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { LocalFile } from "./chris_integration";
import { PluginModels } from "../api/app.config";

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
    const res: any = await pluginInstance.get();
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
  const plcovidnet = await client.getPlugins({ "name_exact": PluginModels.XrayModels["COVID-Net"] });
  const covidnetPlugin = plcovidnet.getItems()[0];
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

export const testGetPacs = async () => {}
