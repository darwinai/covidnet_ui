import ChrisAPIClient from "../api/chrisapiclient"


class DicomViewerService {

  static async fetchImageFile(imageId: string) {
    let client: any = await ChrisAPIClient.getClient();
    let imageData = await client.getFile(imageId);
    console.log(imageData)
  }
}

export default DicomViewerService;