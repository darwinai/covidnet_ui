
## COVID-Net UI Initiative

This repo contains the front-end UI for the COVID-Net initiative, a global open-source initiative started by DarwinAI and the Vision and Image Processing Research Group at the University of Waterloo, with a focus on advancing deep learning AI in the fight against the COVID-19 pandemic.  This COVID-Net UI platform enables easy use of the COVID-Net deep learning models from the main COVID-Net repo (https://github.com/lindawangg/COVID-Net) designed for a variety of tasks such as COVID-19 detection from chest x-rays and CT scans, as well as predict severity of COVID-19 infection from chest x-rays.  The COVID-Net UI platform is being developed by DarwinAI in close partnership with the ChRIS team at the Boston Children's Hospital led by Dr. Rudolph Pienaar (https://www.bu.edu/rhcollab/projects/radiology/) on top of the ChRIS platform.


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