import ChrisAPIClient from "../api/chrisapiclient"
import { Plugin, PluginInstance, IPluginsSearchParams } from "@fnndsc/chrisapi";


// export interface IPluginCreateData {
//   title?: string,
//   previous_id?: string,
//   cpu_limit?: string,
//   memory_limit?: string,
//   number_of_workers?: string,
//   gpu_limit?: string
// }

export const testAnalysis = async () => {
  const client = ChrisAPIClient.getClient();
  let page = 1;
  const feeds = await client.getFeeds({
    limit: 25,
    offset: page * 25,
  });
  const feedArray = feeds.getItems();
  // there are no feeds so currently empty array
  console.log(feedArray)
  const pluginId = 1; // assuming that the plugin with id 1 is 'simplefsapp'
  const data = {
    //previous_id: null,  // instances of 'fs' plugins have previous_id set to null
    title: "Test plugin instance",
    dir: "chris/uploads/cube/"
  };
  let resp = client.createPluginInstance(pluginId, data);
  resp
    .then((plgInstResObj: PluginInstance) => {
      console.log('New plugin instance: ', plgInstResObj);

    })
    .catch(error => {
      console.log('Something went wrong with this request!!!: ', error);
    });
  const searchdata: IPluginsSearchParams = {
    title: "",
    limit:100
  }
  let result = await client.getPlugins(searchdata)
  console.log(result)
}