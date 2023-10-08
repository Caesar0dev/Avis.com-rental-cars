import argparse
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
import re
import undetected_chromedriver as uc
from webdriver_manager.chrome import ChromeDriverManager
import os
from seleniumbase import Driver
import time
import csv

parser = argparse.ArgumentParser()
parser.add_argument('message', help='A message to display')
args = parser.parse_args()
message = args.message
print("argment>>> ", message)



with open('fullLocation.csv', mode='r') as file:
  reader = csv.reader(file)
  for row in reader:
    print(row[2])















# driver = Driver(uc=True)

# driver.maximize_window()

# driver.get("https://www.avis.com/")
# print(">>> Successful")
