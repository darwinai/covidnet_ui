export interface Plugins {
    XrayModels: { [key: string]: string},
    CTModels: { [key: string]: string},
    Plugins: { [key: string]: string}
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
        'PDFGENERATION': 'pl-pdfgeneration-6'
    }
}
