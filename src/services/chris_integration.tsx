import ChrisAPIClient from "../api/chrisapiclient"

export interface LocalFile {
  name: string;
  blob: Blob;
}

class ChrisIntegration {

  static async getFeeds() {
    const client =  ChrisAPIClient.getClient();
    let page = 0
    const feeds = await client.getFeeds({
      limit: 25,
      offset: page * 25,
    });
  }
}

export default ChrisIntegration;