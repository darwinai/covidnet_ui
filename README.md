
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

#### Adding More Plug-ins and Models
If another plug-in is wished to be added to the COVID-Net project:

```
1. Download the plug-in to local computer
2. Follow the above steps of creating the docker image, uploading the plug-in, and registering the plug-in on ChRIS
3. Navigate to app.config.tsx, add the appropriate entry (in Xray Models, CT Models, or Plug-ins)
```

#### Example: Incorporating Multiple Models
The app supports the user to choose from multiple models. For testing purposes of the UI functionality, mocked models that give 2 and 4 are retrievable from the pl-covidnet and pl-ct-covidnet repository on separate branches:

```
1. After downloading both mocked plug-ins and installing the assiocated models, build the docker images
2. Run upload scripts for these two plug-ins:
    2a. http -a cubeadmin:cubeadmin1234 -f POST http://localhost:8010/api/v1/plugins/ dock_image=local/{NAME OF PLUG-IN} \
        descriptor_file@jsonRepresentations/covidnet.json public_repo=https://github.com/FNNDSC/pl-simplefsapp name={NAME OF PLUG-IN}
    2b. http -a cubeadmin:cubeadmin1234 -f POST http://localhost:8010/api/v1/plugins/ dock_image=local/{NAME OF PLUG-IN} \
        descriptor_file@jsonRepresentations/ct_covidnet.json public_repo=https://github.com/FNNDSC/pl-simplefsapp name={NAME OF PLUG-IN}
3. Register the plug-ins via http://localhost:8000/chris-admin/plugins/plugin/
4. In the app.config.tsx file, add the correct entries into the Xray and CT Models section, where the key can be anything (which will be displayed to user on front-end), and the value is the plug-in name from 2a and 2b
5. Now, the front-end will present the user the added models to select from (in the drop-down menu), when creating an analysis
    5a. The mocked pl-covidnet and pl-ct-covidnet models should be displayed on the drop-down and able to be selected by the user
    5b. After creating the analysis, the results will be shown on the dashboard, where there will now be 2 or 4 classifications displayed for the scan now
```