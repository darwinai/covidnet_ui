
## COVID-Net UI Initiative

This repo contains the front-end UI for the COVID-Net app, which is a containerized application for the ChRIS platform built around the COVID-Net initiative. This initiative is a global open-source initiative started by DarwinAI (http://www.darwinai.com) and the Vision and Image Processing Research Group at the University of Waterloo (http://vip.uwaterloo.ca), focussing on advancing deep learning AI in the fight against the COVID-19 pandemic. This user interface, designed specifically for radiologists, lets clinicians easily use the deep learning models from the main COVID-Net repo (https://github.com/lindawangg/COVID-Net) to help detect COVID-19 from chest x-rays and CT scans, as well as predict the severity of a COVID-19 infection from chest x-rays. 

The COVID-Net app is being developed by DarwinAI in close collaboration with the ChRIS team led by individuals in the Advanced Computing Group at Boston Children's Hospital's Fetal-Neonatal Neuroimaging and Developmental Science Center (https://fnndsc.org), with significant contributions from Red Hat, Inc. out of the Boston University/Red Hat collaboratory (https://www.bu.edu/rhcollab/projects/radiology). For more information about ChRIS, see https://chrisproject.org.

### Installation

#### Getting the ChRIS Plugins

1) Clone the plugin repositories

```
https://github.com/darwinai/pl-covidnet

https://github.com/darwinai/pl-CT-covidnet

https://github.com/darwinai/pl-pdfgeneration
```

2) Download the models into plugin folders:
    a) Download the models COVIDNet-CXR4-B, COVIDNet-SEV-GEO, COVIDNet-SEV-OPC from https://github.com/lindawangg/COVID-Net/blob/master/docs/models.md and place them into the covidnet/models subfolder of the pl-covidnet plugin.
    b) Download the model COVIDNet-CT-A from https://drive.google.com/drive/folders/13Cb8yvAW0V_Hh-AvUEDrMEpwLhD3zv-F and place them into the ct_covidnet/models subfolder of the pl-CT-covidnet plugin.

3) Build the Docker Container images for these plugins by running:
```
docker build -t local/pl-covidnet .
docker build -t local/pl-ct-covidnet .
docker build -t local/pl-pdfgeneration .
```

4) Type the following command to verify all images were built successfully:
```
docker image -ls
```
NOTE: If the pl-covidnet plugin fails to build with version compatibility error, open the file requirements.txt and remove the version numbers near tensorflow-estimator and tensorboard.

#### Getting the ChRIS Backend Running

```
git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
cd ChRIS_ultron_backEnd
./make.sh -U -I -i
```

#### Getting the ChRIS Integration Repo to Upload Plugins
```
git clone https://github.com/darwinai/covidnet_integration.git
cd covidnet_integration
./uploadPlugins.sh
```

Optionally, upload mock dicom images for testing:
```
 ./run_mock.sh
```

Note: You can install the required Python packages using this script:
```
 ./install_packages.sh   
```

Now register the plugins on ChRIS:
1. Navigate to http://localhost:8000/chris-admin
2. login with default account with
* Username: chris
* password: chris1234
3. Navigate to plugins page: http://localhost:8000/chris-admin/plugins/plugin/
4. Click `ADD PLUGIN` on top right
5. choose host as compute resource
6. enter plugin name pl-covidnet
7. then save

Repeat this process for all other plugins with their respective names (pl-med2img, pl-ct-covidnet, pl-pdfgeneration).

#### Deployment:
To run inside Docker Container:
```
cd covidnet_ui
docker build -t covidnet_ui .
docker run --rm --name covidnet_ui -p 3000:3000 -d covidnet_ui
```

To run directly from VS Code:
```
yarn or npm install
yarn start
```

### PACS Integration

Instructions for setting up and configuring a local Orthanc PACS server for development can be found [here](https://github.com/FNNDSC/CHRIS_docs/blob/master/usecases/PACS_integration/pacs_integration.adoc). Follow the steps up until the section titled **Query the PACS server**.

Note: PACS integration into `covidnet_ui` is only partially complete. Currently, DICOM files retrieved from the PACS server are stored within the `pypx` container filesystem and a method for transporting these files into the Swift filesystem to be used by the UI has not yet been implemented. This means that in order to test the full workflow of COVID-Net with the current implementation of PACS integration enabled, the DICOM files uploaded to the PACS server must also be manually uploaded to the Swift storage during setup.

#### Setting environment variables

In the `.env` file of the `covidnet_ui` repository, set the following environment variables to enable PACS integration, replacing `<HOST_IP>` and `<HOST_PORT>` with their respective values taken from the PACS setup instructions linked above:

```
REACT_APP_CHRIS_UI_DICOM_SOURCE="pacs"
REACT_APP_CHRIS_UI_PFDCM_URL="http://<HOST_IP>:<HOST_PORT>/api/v1/cmd/"
```

