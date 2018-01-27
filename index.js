var AV = require('leancloud-storage');
var _ = require('lodash');

function asd(){
    var log = this.log;
    var config = this.config;

    var APP_ID = config.leancloud_counter_security.app_id;
    var APP_KEY = config.leancloud_counter_security.app_key;
    var urls = hexo.locals.get('posts').toArray().filter(function (x) { return x.published }).map(function (x) { return { title: x.title, url: "/" + x.path } });
    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
      });

    
    var Counter = AV.Object.extend('Counter');
    _.forEach(urls, (x) => {
        var query = new AV.Query('Counter');
        query.equalTo('url', x.url);
        query.count().then(
            (count) => {
                if(count === 0) {
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
        )
    });
}

hexo.extend.generator.register('hl', asd);