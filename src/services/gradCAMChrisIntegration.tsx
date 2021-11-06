import Client, { PluginInstance } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../api/chrisapiclient";
import { PluginModels, BASE_GRADCAM_MODEL_PLUGIN_NAME } from "../app.config";
import { GradCAMResults } from "../context/reducers/analyseReducer";
import ChrisIntegration from "./chris_integration";
import DicomViewerService from "./dicomViewerService";

class GradCAMChrisIntegration {

  /**
* Gets the list of Grad-CAM results
* @param {number[]} feedIds List of Feed IDs
* @return {Promise<GradCAMResults[]>} Results from analysis
*/
  static async getGradCAMResultsFromFeedIds(feedIds: number[]): Promise<GradCAMResults[]> {
    const results: GradCAMResults[] = await Promise.all(feedIds.map(async (id: number): Promise<GradCAMResults> => {
      const gradcamPlugin = await this.getGradCAMPluginInstanceFromFeedId(id);
      return await this.getGradCAMResultsFromPluginInstance(gradcamPlugin);
    }));

    return results;
  }
  /**
 * Gets Grad-CAM plugin instance that belongs to the given Feed
 * @param {number} feedId Feed ID
 * @return {Promise<PluginInstance>} Grad-CAM plugin instance
 */
  static async getGradCAMPluginInstanceFromFeedId(feedId: number): Promise<PluginInstance> {
    const client: Client = ChrisAPIClient.getClient();
    const pluginData = await client.getPluginInstances({
      feed_id: feedId,
      plugin_name: BASE_GRADCAM_MODEL_PLUGIN_NAME
    });
    return pluginData.getItems()?.filter(item => item.data.plugin_name === PluginModels.Plugins['COVIDNET-GRAD-CAM'])[0];
  }

  /**
* Gets results generated from the Grad-CAM plugin
* @param {PluginInstance} gradcamPlugin Grad-CAM plugin instance
* @return {Promise<GradCAMResults>} Results
*/
  static async getGradCAMResultsFromPluginInstance(gradcamPlugin: PluginInstance): Promise<GradCAMResults> {
    const file = await gradcamPlugin.getFiles({
      limit: 25,
      offset: 0,
    });
    const files = file.getItems();

    let maskImageUrl = "";
    let preprocessedImageUrl = "";
    const urlCreator = window.URL || window.webkitURL;

    const maskFileId = files.filter((file: any) => file.data.fname.split('-').pop().match('mask.png'))?.[0]?.data?.id;
    if (maskFileId) {
      const maskImgBlob = await DicomViewerService.fetchImageFile(maskFileId);
      maskImageUrl = urlCreator.createObjectURL(maskImgBlob);
    }
    const preprocessedFileId = files.filter((file: any) => file.data.fname.split('-').pop().match('preprocessed.png'))?.[0]?.data?.id;
    if (preprocessedFileId) {
      const preprocessedImgBlob = await DicomViewerService.fetchImageFile(preprocessedFileId);
      preprocessedImageUrl = urlCreator.createObjectURL(preprocessedImgBlob);
    }

    const inputMetadataFileId = files.filter((file: any) => file.data.fname.replace(/^.*[\\\/]/, '') === "input.meta.json")?.[0]?.data?.id;
    const inputMetadata = await ChrisIntegration.fetchJsonFiles(inputMetadataFileId);

    return {
      gradcamPluginId: gradcamPlugin.data.id,
      imageName: inputMetadata['imagefile'] ? inputMetadata['imagefile'].split('.')[0] : "",
      maskImageId: maskFileId,
      maskImageUrl: maskImageUrl || "",
      preprocessedImageId: preprocessedFileId,
      preprocessedImageUrl: preprocessedImageUrl || ""
    }
  }
}

export default GradCAMChrisIntegration;