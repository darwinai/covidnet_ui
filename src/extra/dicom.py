from pydicom import dcmread
from os import listdir, system
from os.path import isfile, join
import datetime

base_folder = 'base_images'
folder = '../../../covidnet_integration/images'
baseFile = [[base_folder, f] for f in listdir(base_folder) if isfile(join(base_folder, f))]
dcmFiles = [[folder, f] for f in listdir(folder) if isfile(join(folder, f))]

fileName = 'customDicom_0_'

data = [
        {
        'path': f'SERVICES/PACS/covidnet/{fileName}',
        'PatientID': '55555',
        'PatientName': 'Test Patient',
        'PatientAge': '10000',
        'PatientSex': 'M',
        'PatientBirthDate': '1981-05-05',
        'StudyInstanceUID': '1.2.276.0.7230010.3.1.2.8323329.8519.1517874337.873080',
        'StudyDescription': 'Study Description: Feb 26',
        'SeriesInstanceUID': '1.2.276.0.7230010.3.1.3.8323329.8519.1517874337.873099',
        'SeriesDescription': 'Series Description: Feb 26',
        'StudyDate': '2020-11-01',
        'pacs_name': 'covidnet'
    }
]

for i in range(len(data)):
    f = baseFile[0]
    with open(join(f[0],f[1]), 'rb') as infile:
        ds = dcmread(infile)
        ds.PatientID = data[i]['PatientID']
        ds.PatientName = data[i]['PatientName']
        ds.PatientAge = data[i]['PatientAge']
        ds.PatientSex = data[i]['PatientSex']
        ds.PatientBirthDate = data[i]['PatientBirthDate']
        ds.StudyInstanceUID = data[i]['StudyInstanceUID']
        ds.StudyDescription = data[i]['StudyDescription']
        ds.SeriesInstanceUID = data[i]['SeriesInstanceUID']
        ds.SeriesDescription = data[i]['SeriesDescription']
        ds.StudyDate = data[i]['StudyDate']
        fname = data[i]['SeriesInstanceUID'][-3:]
        ds.save_as(f'../covidnet_integration/images/custom0_{fname}.dcm')

for index in range(len(dcmFiles)):
  f = dcmFiles[index]
  with open(join(f[0],f[1]), 'rb') as infile:
      ds = dcmread(infile)
      print(ds)