# COVID-Net UI Initiative

This repo contains the front-end UI for the COVID-Net app, which is a containerized application for the ChRIS platform built around the COVID-Net initiative. This initiative is a global open-source initiative started by DarwinAI (http://www.darwinai.com) and the Vision and Image Processing Research Group at the University of Waterloo (http://vip.uwaterloo.ca), focussing on advancing deep learning AI in the fight against the COVID-19 pandemic. This user interface, designed specifically for radiologists, lets clinicians easily use the deep learning models from the main COVID-Net repo (https://github.com/lindawangg/COVID-Net) to help detect COVID-19 from chest x-rays and CT scans, as well as predict the severity of a COVID-19 infection from chest x-rays.

The COVID-Net app is being developed by DarwinAI in close collaboration with the ChRIS team led by individuals in the Advanced Computing Group at Boston Children's Hospital's Fetal-Neonatal Neuroimaging and Developmental Science Center (https://fnndsc.org), with significant contributions from Red Hat, Inc. out of the Boston University/Red Hat collaboratory (https://www.bu.edu/rhcollab/projects/radiology). For more information about ChRIS, see https://chrisproject.org.

## Installation

### Initial Docker Swarm

```shell
docker swarm init --advertise-addr 127.0.0.1
```

### Getting the ChRIS Backend Running

```shell
git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
cd ChRIS_ultron_backEnd
./make.sh -U -I -i
```

### Getting the ChRIS Plugins

Plugins can be retrieved from Docker Hub or they can be built from source code.

#### Using Docker images from Docker Hub

```shell
git clone https://github.com/darwinai/covidnet_integration.git
cd covidnet_integration
cp postscript.sh <path to ChRIS_ultron_backEnd> (typically ../ChRIS_ultron_backEnd)
cd <path to ChRIS_ultron_backEnd>
./postscript.sh
```

#### Building from source

**NOTE**:*Skip this section if you have downloaded the Docker images from Docker Hub.*

##### Building Docker Images

1. Clone the plugin repositories

```shell
https://github.com/darwinai/pl-covidnet

https://github.com/darwinai/pl-CT-covidnet

https://github.com/darwinai/pl-pdfgeneration

https://github.com/darwinai/pl-grad-cam
```

2. Download the models into plugin folders:
   a) Download the models COVIDNet-CXR4-B, COVIDNet-SEV-GEO, COVIDNet-SEV-OPC from https://github.com/lindawangg/COVID-Net/blob/master/docs/models.md and place them into the covidnet/models subfolder of the pl-covidnet plugin.
   b) Download the model COVIDNet-CT-A from https://drive.google.com/drive/folders/13Cb8yvAW0V_Hh-AvUEDrMEpwLhD3zv-F and place them into the ct_covidnet/models subfolder of the pl-CT-covidnet plugin.

3. Build the Docker Container images for these plugins by running:

```shell
docker build -t local/pl-covidnet .
docker build -t local/pl-ct-covidnet .
docker build -t local/pl-pdfgeneration .
docker build -t local/pl-grad-cam .
```

4. Type the following command to verify all images were built successfully:

```shell
docker image -ls
```

NOTE: If the pl-covidnet plugin fails to build with version compatibility error, open the file requirements.txt and remove the version numbers near tensorflow-estimator and tensorboard.

##### Uploading Plugins through the ChRIS Integration Repo

```shell
git clone https://github.com/darwinai/covidnet_integration.git
cd covidnet_integration
./uploadPlugins.sh
```

Note: You can install the required Python packages using this script:

```shell
 ./install_packages.sh
```

Install httpie using the following instructions: https://httpie.io/docs#installation

Now register the plugins on ChRIS:

1. Navigate to http://localhost:8000/chris-admin
2. login with default account with

- Username: chris
- password: chris1234

3. Navigate to plugins page: http://localhost:8000/chris-admin/plugins/plugin/
4. Click `ADD PLUGIN` on top right
5. choose host as compute resource
6. enter plugin name pl-covidnet
7. then save

Repeat this process for all other plugins with their respective names (pl-med2img, pl-ct-covidnet, pl-pdfgeneration).

### Uploading DICOM data to Swift

**Note**: PACS integration into `covidnet_ui` is still under development. Currently, DICOM files retrieved from the PACS server are stored within the `pypx` container filesystem. A method for transporting these files into the Swift filesystem to be accessible by the UI has not yet been implemented. This means that in order to test the full workflow of COVID-Net with the current implementation of PACS integration enabled, the DICOM files that were uploaded to the PACS server must also be manually uploaded to the Swift storage during setup:

<!-- TO DO: add DICOM files with proper headers -->

When testing out COVID-Net with PACS integration, be sure to delete any PACS files currently in the Swift storage and upload the DICOM files from `/covidnet_integration/images` without the `mock` flag:

<!-- TO DO: include instructions to upload using particular packages specified by fnndsc -->

```shell
cd <path to the covidnet_integration repo>
./make.sh
export IMAGES_DIR="$PWD/images"
docker run --network host -v ${IMAGES_DIR}:/images covidnet_integration upload_swift_notify_cube.py --imageDir /images
```

Update the `IMAGES_DIR` variable to point to where your images are.

### Deployment

To run inside Docker Container:

```shell
cd covidnet_ui
docker build -t covidnet_ui .
docker run --rm --name covidnet_ui -p 3000:3000 -d covidnet_ui
```

Once the container is up, you can access the COVID-Net UI through http://localhost:3000. Use the following username and password to log in.

- Username: `chris`
- Password: `chris1234`

### Development

```shell
yarn
yarn start
```

### Tearing Down

```shell
docker stop covidnet_ui
```

Remove CUBE backend containers:

```bash
cd <path to ChRIS_ultron_backend>
./unmake.sh
```

Remove the local Docker Swarm cluster if desired:

```bash
docker swarm leave --force
```

### Adding More Plug-ins and Models

If another plug-in is wished to be added to the COVID-Net UI project:

1. Follow corresponding steps of installation, creating the docker image, uploading, and registering the plug-in on ChRIS
2. Navigate to app.config.tsx, add the appropriate entry (in Xray Models, CT Models, or Plug-ins) with the plug-in's name and its alias to be used in the app

### Example: Incorporating Multiple Models

The app supports the user to choose from multiple models. For testing purposes of the UI functionality, mocked models that give 2 and 4 are retrievable from the "extra" directory under src/api/models:

1. Unzip the plug-ins, and follow the above directions for adding the necessary models into pl-covidnet-2 (use the same instructions as pl-covidnet) and pl-ct-covidnet-4 (use same instructions as pl-ct-covidnet)
2. Build the docker images
3. Run upload scripts for these two plug-ins:
    3a. http -a cubeadmin:cubeadmin1234 -f POST http://localhost:8010/api/v1/plugins/ dock_image=local/{NAME OF PLUG-IN} \
        descriptor_file@jsonRepresentations/covidnet.json public_repo=https://github.com/FNNDSC/pl-simplefsapp name={NAME OF PLUG-IN}
    3b. http -a cubeadmin:cubeadmin1234 -f POST http://localhost:8010/api/v1/plugins/ dock_image=local/{NAME OF PLUG-IN} \
        descriptor_file@jsonRepresentations/ct_covidnet.json public_repo=https://github.com/FNNDSC/pl-simplefsapp name={NAME OF PLUG-IN}
4. Register the plug-ins via http://localhost:8000/chris-admin/plugins/plugin/
5. In the app.config.tsx file, add the correct entries into the Xray and CT Models section, where the key can be anything (which will be displayed to user on front-end), and the value is the plug-in name from 3a and 3b
6. Now, the front-end will present the user the added models to select from (in the drop-down menu), when creating an analysis
    7a. The mocked pl-covidnet and pl-ct-covidnet models should be displayed on the drop-down and able to be selected by the user
    7b. After creating the analysis, the results will be shown on the Past Predictions dashboard, where there will now be 2 or 4 classifications displayed for the scan now
```
### PACS Integration

The following section provides a guide for enabling COVID-Net to query and retrieve DICOM files from a local PACS server, as opposed to using mock files directly uploaded to Swift.

### Setting up an Orthanc PACS server and `pfdcm`

Instructions for setting up a local Orthanc PACS server and `pfdcm` can be found [here](https://github.com/FNNDSC/CHRIS_docs/blob/master/usecases/PACS_integration/pacs_integration.adoc). There are a few things to note when following the steps:

- Follow the steps up until the section titled **Query the PACS server**. The steps that follow are simply for querying and retrieving from PACS via the command line.
- At the step for uploading DICOM files to Orthanc, use the DICOM files from `/covidnet_integration/images` .
- Make note of the `HOST_IP` and `HOST_PORT` values used.

### Setting environment variables

In the `.env` file of the `covidnet_ui` repository, set the following environment variables to enable PACS integration, replacing `<HOST_IP>` and `<HOST_PORT>` with their respective values taken from the PACS setup instructions linked above:

```shell
REACT_APP_CHRIS_UI_DICOM_SOURCE="pacs"
REACT_APP_CHRIS_UI_PFDCM_URL="http://<HOST_IP>:<HOST_PORT>/api/v1/cmd/"
```

Note: for `REACT_APP_CHRIS_UI_DICOM_SOURCE`, using any value other than `pacs` will default COVID-Net to fetching files directly from Swift.
