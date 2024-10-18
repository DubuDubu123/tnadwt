const shgSchema = require("../schemas/shg.schema")
// const mongo = require("../utils/mongo")
const mysql = require("../utils/mysql")

const SHG_COLL_NAME = "shgMapTest"

var keyPairs = [

    {
        colName: "bankDetails.bankName", //done
        arrayName: "bankData"
    },
    {
        colName: "formationYear",
        arrayName: "formationData"
    },
    {
        colName: "category", //done
        arrayName: "categoryData"
    },
    {
        colName: "grading.date",//done
        arrayName: "gradedData"
    },
    {
        colName: "auditingDate",//done
        arrayName: "auditedData"
    },
    {
        colName: "formedBy",//done
        arrayName: "formedData"
    },
    {
        colName: "PLF.shgFederated",//done
        arrayName: "federatedData"
    },
    {
        colName: "grading.category",//done
        arrayName: "gradeData"
    }, 
    // {
    // colName: "Credit Linked",
    // arrayName: "creditLinkedData"
    // },
     {
        colName: "rf.received", //done
        arrayName: "rfReceivedData" 
    },
    {
        colName: "cif.received", //done
        arrayName: "cifReceivedData"
    }, {
        colName: "asf.received", //done
        arrayName: "asfReceivedData"
    }
]

const getDistrictData = async (req, res) => {
    try {
        console.log("fddsfffffffffffffffffffffffffff-------===================")
        const model = mongo.conn.model("shg", shgSchema, SHG_COLL_NAME)
        var matchQuery = {
            district: req.params.district?.toUpperCase()
        }
        var resData = {
            districtName: req.params.district
        }
        if (req.params.district === 'all') {
            matchQuery = {}
            resData.districtName = 'All Districts'
        }
        if (req.query.block) {
            matchQuery.block = req.query.block
            resData.blockName = req.query.block
        }
        var reqDataArray = req.query.reqData ? req.query.reqData.split(",") : keyPairs.map((item) => item.arrayName)

        for (var i = 0; i < reqDataArray.length; i++) {
            var keyPair = keyPairs.find((item) => item.arrayName === reqDataArray[i])
            if (keyPair) {
                var data = await getKeyUniqueValue(model, keyPair.colName, matchQuery)
                resData[keyPair.arrayName] = data
            }
        }
        res.status(200).json(resData)
    }
    catch (error) {
        console.log("fddsfffffffffffffffffffffffffff-------===================")
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getDistrictStats = async (req, res) => {
    try {
        const model = mongo.conn.model("shg", shgSchema, SHG_COLL_NAME)
        var matchQuery = {
            district: req.params.district?.toUpperCase()
        }
        var resData = {
            districtName: req.params.district
        }
        if (req.params.district === 'all') {
            matchQuery = {}
            resData.districtName = 'All Districts'
        }
        if (req.query.block) {
            matchQuery.block = req.query.block
            resData.blockName = req.query.block
        }
        console.log(matchQuery,req.params.district,req.params.district!=='all')
        if(req.params.district!=='all'){

            resData.blocks = await getKeyUniqueValue(model, "block", matchQuery)
        }else{
            resData.blocks=[]
        }
        console.log(resData)
        resData.stats = await getStats(model, matchQuery)
        res.status(200).json(resData)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}


module.exports = {
    getDistrictData,
    getDistrictStats
}

const getStats = async (model, matchQuery) => {
    console.log("🚀 ~ file: dashboardController.js:132 ~ getStats ~ matchQuery:", matchQuery)
    try {
        var data = await model.find(matchQuery,{'rf':1,'cif':1,'asf':1,'SHGSavings.totalSaving':1}).lean()
        const rfAmount = data.reduce((acc,curr)=>acc+curr.rf.amount,0)
        const rfReceived = data.filter((item)=>item.rf.received==='yes').length
        const cifAmount = data.reduce((acc,curr)=>acc+curr.cif.amount,0)
        const cifReceived = data.filter((item)=>item.cif.received==='yes').length
        const asfAmount = data.reduce((acc,curr)=>acc+curr.asf.amount,0)
        const asfReceived = data.filter((item)=>item.asf.received==='yes').length
        const totalSavings = data.reduce((acc,curr)=>acc+curr.SHGSavings.totalSaving,0)
        const shg = data.length
        let statsData = [rfAmount,cifAmount,asfAmount,totalSavings]

        statsData = statsData.map((number) => {
            let currency = number;
            if (currency >= 10000000)
                currency =
                    (number / 10000000).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                    }) + " CR";
            else if (currency >= 100000)
                currency =
                    (number / 100000).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                    }) + " L";
            else if (currency >= 1000)
                currency =
                    (number / 1000).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                    }) + " k";
            return currency;
        });

        const stats = {
            shg,
            rfReceived,
            rfAmount: statsData[0],
            cifReceived,
            cifAmount: statsData[1],
            asfReceived,
            asfAmount: statsData[2],
            totalSavings: statsData[3]
            //missing credit linked and total amount
        }
        return stats
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}



const getKeyUniqueValue = async (model, key, matchQuery) => {
    var groupObj;
    if (key === 'auditingDate'|| key === 'grading.date') {
        groupObj = {
            _id: {
                $cond: {
                    if: { $eq: [`$${key}`, ""] },
                    then: "no",
                    else: "yes"
                }
            },
            count: { $sum: 1 }
        }
    } 
    else {
        groupObj = {
            _id: `$${key}`,
            count: { $sum: 1 },
        }
    }
    try {
        const data = await model
            .aggregate([
                {
                    $match: matchQuery,
                },
                {
                    $group: groupObj
                },
                {
                    $project: {
                        string: "$_id",
                        count: 1,
                        _id: 0
                    },
                },
                {
                    $sort: {
                        string: 1
                    }
                }
            ])
            .exec();
        return data;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }

}