module.exports.cors = (req,res,next)=>{
        res.set('Access-control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', '*');
        res.set('Access-Control-Allow-Headers', req.header('access-control-request-headers'));
        next();
};

