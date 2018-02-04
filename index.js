var AV = require('leancloud-storage');
var _ = require('lodash');
var readlineSync = require('readline-sync');

async function asd() {
    var log = this.log;
    var config = this.config;

    log.info('hexo-leancloud-counter-security');

    var APP_ID = config.leancloud_counter_security.app_id;
    var APP_KEY = config.leancloud_counter_security.app_key;
    var urls = hexo.locals.get('posts').toArray().filter(function (x) { return x.published }).map(function (x) { return { title: x.title, url: "/" + x.path } });
    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
    });

    var currentUser = AV.User.current();
    if (!currentUser) {
        log.info('login');
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
            (loginedUser) => { log.info(loginedUser.getUsername()); },
            (error) => { log.error(error); }));
    }

    var Counter = AV.Object.extend('Counter');
    _.forEach(urls, async (x) => {
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
                        (obj) => { log.info("saved as: " + obj.id); },
                        (error) => { log.error(error); }
                    );
                }
            },
            (error) => { log.error(error); }
        );
    });
}

hexo.extend.generator.register('hl', asd);

command_options = {
    desc: 'asd',
    usage: '<username> <password>'
};

hexo.extend.console.register('hl', 'hlhl', command_options, function (args) {
    var log = this.log;
    var config = this.config;

    var APP_ID = config.leancloud_counter_security.app_id;
    var APP_KEY = config.leancloud_counter_security.app_key;
    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
    });

    if (args._.length !== 2) {
        log.info('use right');
    }
    else {
        var user = new AV.User();
        user.setUsername(args._[0]);
        user.setPassword(args._[1]);
        user.signUp().then(
            (loginedUser) => { log.info(loginedUser.getUsername() + " is successfully signed up"); },
            (error) => { log.error(error); });
    }
});