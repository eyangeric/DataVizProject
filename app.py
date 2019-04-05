import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/BullsBearsDB.sqlite"

engine = create_engine('sqlite:///db/BullsBearsDB.sqlite', echo=False)

##########Treasury Yield Dataset
#set up as pandas dataframe and rename variables
Treasury_Yield_DF = pd.DataFrame(engine.execute("SELECT * FROM Treasury_Yield").fetchall())
Treasury_Yield_DF = Treasury_Yield_DF.rename(columns={0: "date", 1: "R_3M", 2: "R_6M", 
                                                      3: "R_1Y", 4: "R_2Y", 5: "R_3Y",
                                                      6: "R_5Y", 7: "R_7Y", 8: "R_10Y"})

#convert pandas dataframe to json
Treasury_Yield_Json = Treasury_Yield_DF.to_json(orient='records')


##########November to January Tweets Dataset
#set up as pandas dataframe and rename variables
Nov_Jan_Tweets_DF = pd.DataFrame(engine.execute("SELECT * FROM nov_jan_tweets").fetchall())
Nov_Jan_Tweets_DF = Nov_Jan_Tweets_DF.rename(columns={0: "tweet", 1: "Date", 2: "Month", 3: "Day", 4: "Year", 5: "User"})
Nov_Jan_Tweets_DF = Nov_Jan_Tweets_DF["tweet"]

#convert pandas dataframe to json
Nov_Jan_Tweets_Json = Nov_Jan_Tweets_DF.to_json(orient='records')


##########January to March Tweets Dataset
#set up as pandas dataframe and rename variables
Jan_Mar_Tweets_DF = pd.DataFrame(engine.execute("SELECT * FROM jan_mar_tweets").fetchall())
Jan_Mar_Tweets_DF = Jan_Mar_Tweets_DF.rename(columns={0: "tweet", 1: "Date", 2: "Month", 3: "Day", 4: "Year", 5: "User"})
Jan_Mar_Tweets_DF = Jan_Mar_Tweets_DF["tweet"]

#convert pandas dataframe to json
Jan_Mar_Tweets_Json = Jan_Mar_Tweets_DF.to_json(orient='records')


# ##########S&P 500 Dataset
# #set up as pandas dataframe and rename variables
# SAP500_DF = pd.DataFrame(engine.execute("SELECT * FROM SAP500").fetchall())
# SAP500_DF = SAP500_DF.rename(columns={0: "Date", 1: "Open", 2: "High", 3: "Low", 4: "Close", 5: "Adj_Close", 6: "Volume"})

# #convert pandas dataframe to json
# SAP500_json = SAP500_DF.to_json(orient='records')


#set up routes
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/treasuryyields")
def yields():
    """Return """
    return(jsonify(Treasury_Yield_Json))

@app.route("/Nov_Jan_Tweets")
def Nov_Jan_Tweets():
    """Return """
    return(jsonify(Nov_Jan_Tweets_Json))

@app.route("/Jan_Mar_Tweets")
def Jan_Mar_Tweets():
    """Return """
    return(jsonify(Jan_Mar_Tweets_Json))

# @app.route("/sap500_data")
# def sap500_route():
#     """Return """
#     return(jsonify(SAP500_json))

if __name__ == "__main__":
    app.run()