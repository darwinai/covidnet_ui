export interface Plugins {
    XrayModels: { [key: string]: string },
    CTModels: { [key: string]: string },
    Plugins: { [key: string]: string }
}

export const PluginModels: Plugins = {
    XrayModels: { // Place Xray models here
        'COVID-Net': 'pl-covidnet'
    },
    CTModels: { // Place CT models here
        'CT-COVID-Net': 'pl-ct-covidnet'
    },
    Plugins: { // Place other app plug-ins here
        'FS_PLUGIN': 'pl-dircopy',
        'MED2IMG': 'pl-med2img',
        'PDFGENERATION': 'pl-covidnet-pdfgeneration',
        'COVIDNET-GRAD-CAM': 'pl-covidnet-grad-cam'
    }
}

// The base filepath for PACS files in the Swift storage
export const BASE_PACS_FILE_PATH = 'SERVICES/PACS/covidnet/';

// Note title for when creating pl-dircopy instance
export const FEED_NOTE_TITLE = "COVIDNET_ANALYSIS_NOTE";

export const BASE_COVIDNET_MODEL_PLUGIN_NAME = "covidnet";

export const BASE_GRADCAM_MODEL_PLUGIN_NAME = "covidnet-grad-cam";

// Time interval in ms to poll ChRIS for new analysis results
export const RESULT_POLL_INTERVAL = 10000;
