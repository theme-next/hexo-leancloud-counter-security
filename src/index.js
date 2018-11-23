var AV = require('leancloud-storage');
var _ = require('lodash');
var readlineSync = require('readline-sync');
var packageInfo = require('./package.json');
var pathFn = require('path');
var fs = require('fs');

function generate_post_list(locals) {
    var config = this.config;
    if (config.leancloud_counter_security.enable_sync) {
        var urlsPath = 'leancloud_counter_security_urls.json';
        var urls = [].concat(locals.posts.toArray())
                     .filter((x) => { return x.published })
                     .map((x) => {return {
                         title: x.title,
                         url: config.root  + x.path
                     }});
        return {
            path: urlsPath,
            data: JSON.stringify(urls)
        };
    }
}

hexo.extend.generator.register('leancloud_counter_security_generator', generate_post_list);

async function sync() {
    var log = this.log;
    var config = this.config;

    if (config.leancloud_counter_security.enable_sync) {
        var APP_ID = config.leancloud_counter_security.app_id;
        var APP_KEY = config.leancloud_counter_security.app_key;
        var publicDir = this.public_dir;
        var UrlsFile = pathFn.join(publicDir, 'leancloud_counter_security_urls.json');
        var urls = JSON.parse(fs.readFileSync(UrlsFile, 'utf8'));

        AV.init({
            appId: APP_ID,
            appKey: APP_KEY
        });

        var currentUser = AV.User.current();
        if (!currentUser) {
            var userName = config.leancloud_counter_security.username;
            var passWord = config.leancloud_counter_security.password;
            if (!userName) {
                userName = readlineSync.question('Enter your username: ');
                passWord = readlineSync.question('Enter your password: ', { hideEchoBack: true });
            }
            else if (!passWord) {
                passWord = readlineSync.question('Enter your password: ', { hideEchoBack: true });
            }
            await (AV.User.logIn(userName, passWord).then(
                (loginedUser) => { log.info('Logined as: ' + loginedUser.getUsername()); },
                (error) => { log.error(error); }));
        }

        log.info('Now syncing your posts list to leancloud counter...');
        var Counter = AV.Object.extend('Counter');
        urls.sort(cmp);
        var memoFile = pathFn.join(publicDir, "leancloud.memo");
        if(!fs.existsSync(memoFile)){
            fs.writeFileSync(memoFile, "[\n]");
        }
        var memoData = fs.readFileSync(memoFile, "utf-8").split("\n");
        var memoIdx = 1;
        var newData = [];
        var cnt = 0;
        var limit = 0;
        var env = this;
        _.forEach(urls, (x) => {
            var y = {};
            y.title = "";
            y.url = "";
            var flag = false;
            while(true){
                if(memoData[memoIdx] == ']') break;
                y = JSON.parse(memoData[memoIdx].substring(0, memoData[memoIdx].length-1));
                if(y.url > x.url) break;
                if(y.url == x.url && y.title == x.title){
                    flag = true;
                    break;
                }
                memoIdx++;
            }
            if(!flag) {
                log.info("Dealing with record of " + x.title);
                limit++;
                var query = new AV.Query('Counter');
                query.equalTo('url', x.url);
                query.count().then(
                    (count) => {
                        if (count === 0) {
                            var counter = new Counter();
                            counter.set('url', x.url);
                            counter.set('title', x.title);
                            counter.set('time', 0);
                            counter.save().then(
                                (obj) => { 
                                    log.info(x.title + ' is saved as: ' + obj.id); 
                                    newData.push(x);
                                    cnt++;
                                    postOperation(env, cnt, limit, newData, memoData);
                                },
                                (error) => { 
                                    log.error(error); 
                                    cnt++;
                                    postOperation(env, cnt, limit, newData, memoData);
                                }
                            );
                        }
                        else{
                            newData.push(x);
                            cnt++;
                            postOperation(env, cnt, limit, newData, memoData);
                        }
                    },
                    (error) => { 
                        log.error(error); 
                        cnt++;
                        postOperation(env, cnt, limit, newData, memoData);
                    }
                );
            }
        });
    }
}

hexo.extend.deployer.register('leancloud_counter_security_sync', sync);

var commandOptions = {
    desc: packageInfo.description,
    usage: ' <argument>',
    'arguments': [
        {
            'name': 'register | r <username> <password>',
            'desc': 'Register a new user.'
        }
    ]
};

function commandFunc(args) {
    var log = this.log;
    var config = this.config;

    if (args._.length !== 3) {
        log.error('Too Few or Many Arguments.');
    }
    else if (args._[0] === 'register' || args._[0] === 'r') {
        var APP_ID = config.leancloud_counter_security.app_id;
        var APP_KEY = config.leancloud_counter_security.app_key;
        AV.init({
            appId: APP_ID,
            appKey: APP_KEY
        });

        var user = new AV.User();
        user.setUsername(String(args._[1]));
        user.setPassword(String(args._[2]));
        user.signUp().then(
            (loginedUser) => { log.info(loginedUser.getUsername() + ' is successfully signed up'); },
            (error) => { log.error(error); });
    }
    else {
        log.error('Unknown Command.');
    }
}

hexo.extend.console.register('lc-counter', 'hexo-leancloud-counter-security', commandOptions, commandFunc);

function cmp(x, y){
    if(x.url < y.url)
        return -1;
    else if(x.url == y.url)
        return 0;
    else return 1;
}

var postOperation = function (env, cnt, limit, newData, memoData){
    if(cnt == limit){
        var log = env.log;
        newData.sort(cmp);
        var sourceDir = env.source_dir;
        var publicDir = env.public_dir;
        var memoFile = pathFn.join(sourceDir, "leancloud.memo");
        fs.writeFileSync(memoFile, "[\n");
        
        var memoIdx = 1;
        for(var i = 0; newData[i]; i++){
            while(true){
                if(memoData[memoIdx] == ']') break;
                var y = JSON.parse(memoData[memoIdx].substring(0, memoData[memoIdx].length-1));
                if(y.url > newData[i].url) break;
                
                fs.writeFileSync(memoFile, memoData[memoIdx] + "\n", {'flag':'a'});
                memoIdx++;
            }
            fs.writeFileSync(memoFile, "{\"title\":\"" + newData[i].title + "\",\"url\":\"" + newData[i].url + "\"},\n", {'flag':'a'});
        }
        while(memoData[memoIdx] != ']'){
            fs.writeFileSync(memoFile, memoData[memoIdx] + "\n", {'flag':'a'});
            memoIdx++;
        }
        fs.writeFileSync(memoFile, memoData[memoIdx], {'flag':'a'});
        
        var srcFile = pathFn.join(sourceDir, "leancloud.memo");
        var destFile = pathFn.join(publicDir, "leancloud.memo");
        var readStream = fs.createReadStream(srcFile);
        var writeStream = fs.createWriteStream(destFile);
        readStream.pipe(writeStream);
        console.log("leancloud.memo successfully updated.");
    }
}
