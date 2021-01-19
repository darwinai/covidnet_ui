
## COVID-Net UI Initiative

This repo contains the front-end UI for the COVID-Net app, which is a containerized application for the ChRIS platform built around the COVID-Net initiative. This initiative is a global open-source initiative started by DarwinAI (http://www.darwinai.com) and the Vision and Image Processing Research Group at the University of Waterloo (http://vip.uwaterloo.ca), focussing on advancing deep learning AI in the fight against the COVID-19 pandemic. This user interface, designed specifically for radiologists, lets clinicians easily use the deep learning models from the main COVID-Net repo (https://github.com/lindawangg/COVID-Net) to help detect COVID-19 from chest x-rays and CT scans, as well as predict the severity of a COVID-19 infection from chest x-rays. 

The COVID-Net app is being developed by DarwinAI in close collaboration with the ChRIS team led by individuals in the Advanced Computing Group at Boston Children's Hospital's Fetal-Neonatal Neuroimaging and Developmental Science Center (https://fnndsc.org), with significant contributions from Red Hat, Inc. out of the Boston University/Red Hat collaboratory (https://www.bu.edu/rhcollab/projects/radiology). For more information about ChRIS, see https://chrisproject.org.

### Installation

#### Getting the ChRIS Plugins

Follow the setup instruction in pl-covidnet's README and pl-CT-covidnet's README to put the pretained models in the required folder.

```
https://github.com/darwinai/pl-covidnet

https://github.com/darwinai/pl-CT-covidnet

https://github.com/darwinai/pl-pdfgeneration
```

Ensure you build the docker containers for these plugins by:
```
docker build -t  {name_of_the_plugin} .

```

#### Getting the ChRIS Backend Running

```
git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
cd ChRIS_ultron_backEnd
./make -U -I -i
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

Repeat this process for all other plugins with their respective names.

#### Deployment:
```
cd covidnet_ui
docker build -t covidnet_ui .
docker run --rm --name covidnet_ui -p 3000:3000 -d covidnet_ui
```
