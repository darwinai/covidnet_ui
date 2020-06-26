import ChrisAPIClient from "../api/chrisapiclient"


class DicomViewerService {

  static async fetchImageFile(imageId: string): Promise<Blob> {
    let client: any = await ChrisAPIClient.getClient();
    let imageData = await client.getFile(imageId);
    return (await imageData.getFileBlob());
  }
}

export default DicomViewerService;