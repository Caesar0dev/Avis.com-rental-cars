import argparse
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import re
import undetected_chromedriver as uc
from webdriver_manager.chrome import ChromeDriverManager
import os
from seleniumbase import Driver
import time
import csv
from datetime import datetime, timedelta

parser = argparse.ArgumentParser()
parser.add_argument('message', help='A message to display')
args = parser.parse_args()
start_date = args.message
print("start_date >>> ", start_date) ################## data to send
rentYear = start_date.split("/")[2]
rentMonth = start_date.split("/")[0]
rentDate= start_date.split("/")[1]

startDate = datetime(int(rentYear), int(rentMonth), int(rentDate))

endDate = startDate + timedelta(days=330)
# print("result_date >>> ", endDate)
middle_end_date = str(endDate).split(" ")[0]
# print("middle end date >>> ", middle_end_date)
end_date = middle_end_date.split("-")[1] + "/" + middle_end_date.split("-")[2] + "/" + middle_end_date.split("-")[0]
print("end_date >>> ", end_date) ################## data to send

transDate = '{"start_date":"' + start_date + '", "end_date":"' + end_date + '"}'

with open('transmition.txt', 'w') as file:
  file.write(str(transDate))


searchkey = []

with open('fullLocation.csv', mode='r') as file:
  reader = csv.reader(file)
  for row in reader:
    targetLocation = row[2].split("/")[-1]
    # print(">>>>>>>>>>>>>", targetLocation) ################### data to send
    searchkey.append(targetLocation)

print("searchkey >>> ", searchkey)


driver = Driver(uc=True)

driver.maximize_window()

driver.get("https://vinesplus.com/")
productButton = driver.find_element(By.XPATH, '//*[@id="shopify-section-header"]/sticky-header/header/nav/ul/li[2]/a/span')
productButton.click()
print(">>> Page load Successfully!")
