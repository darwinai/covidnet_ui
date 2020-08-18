
## COVID-Net UI Initiative

This repo contains the front-end UI for the COVID-Net app, which is a containerized application for the ChRIS platform built around the COVID-Net initiative, a global open-source initiative started by DarwinAI (http://www.darwinai.com) and the Vision and Image Processing Research Group at the University of Waterloo (http://vip.uwaterloo.ca), with a focus on advancing deep learning AI in the fight against the COVID-19 pandemic. This user interface, designed specifically for radiologists, enables clinicians to easily use the deep learning models from the main COVID-Net repo (https://github.com/lindawangg/COVID-Net) to help detect COVID-19 from chest x-rays and CT scans, as well as predict severity of COVID-19 infection from chest x-rays. 

The COVID-Net app is being developed by DarwinAI in close collaboration with the ChRIS team led by individuals in the Advanced Computing Group at Boston Children's Hospital's Fetal-Neonatal Neuroimaging and Developmental Science Center (https://fnndsc.org), with significant contributions from Red Hat, Inc out of the Boston University/Red Hat collaboratory (https://www.bu.edu/rhcollab/projects/radiology). For more information on ChRIS, see https://chrisproject.org.

### Installation

#### get the ChRIS plugins at the following repos

```
https://github.com/darwinai/pl-covidnet

https://github.com/darwinai/pl-CT-covidnet

https://github.com/darwinai/pl-pdfgeneration
```

Please ensure you build the docker containers for these plugins by
```
docker build -t  {name_of_the_plugin} .

```

#### Get the ChRIS backend running

```
git clone https://github.com/FNNDSC/ChRIS_ultron_backEnd.git
cd ChRIS_ultron_backEnd
./make -U -I -i
```

#### get the ChRIS integration repo to upload plugins
```
git clone https://github.com/darwinai/covidnet_integration.git
cd covidnet_integration
./uploadPlugins.sh
```

Optionally, upload mock dicom images for testing
```
 ./run_mock.sh
```

Note: You can Install the required python packages using this script
```
 ./install_packages.sh   
```

Now register the plugins on ChRIS
1. Navigate to http://localhost:8000/chris-admin
2. login with default account with
* Username: chris
* password: chris1234
3. Navigate to plugins page: http://localhost:8000/chris-admin/plugins/plugin/
4. Click `ADD PLUGIN` on top right
5. choose host as compute resource
6. enter plugin name pl-covidnet
7. then save

repeat this process for all other plugins with their respective names

#### Deployment:
```
cd covidnet_ui
docker build -t covidnet_ui .
docker run --rm --name covidnet_ui -p 3000:3000 -d covidnet_ui
```