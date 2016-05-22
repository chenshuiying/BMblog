import {default as model_default,page as model_page,list as model_list} from '../models/page';
import {setString} from '../../app/tool/common_tool.js';
export default (ctx,next) =>{
        return model_default(ctx).then((result) => {
            if (result.post.length == 0) {
                return next();
            } else {
                result.post[0].post_content = marked(result.post[0].post_content.replace(/\r\n/ig, '<br/>'));
    
                var options = "{";
                for (var n = 0; n < result.options.length; n++) {
                    options = options + "\"" + result.options[n].option_name + "\":\"" + result.options[n].option_value + "\"";
                    if (n < result.options.length - 1) {
                        options = options + ",";
                    }
                }
                options = JSON.parse(options + "}");
    
                var posts = {
                    options: options,
                    post: result.post[0],
                    post_comment: result.comment,
                    post_comment_back: result.comment_back,
                    post_tag: result.tag,
                    post_category: result.category,
                    friendly_link: result.friendly_link
                };
    
                ctx.render('post', posts);
            }
        });
};

export var page = (ctx) =>{
    return model_page(ctx).then((result) => {
        if (result.length == 0) {
            ctx.throw(404, '未找该页面或没有任何文章内容!');
        } else {
            for (var a = 0; a < result.post.length; a++) {
                result.post[a].post_content = setString(result.post[a].post_content.replace(/<[^>]+>/g, ""), 200);//去掉所有的html标记
            }

            var options = "{";
            for (var n = 0; n < result.options.length; n++) {
                options = options + "\"" + result.options[n].option_name + "\":\"" + result.options[n].option_value + "\"";
                if (n < result.options.length - 1) {
                    options = options + ",";
                }
            }
            options = JSON.parse(options + "}");

            var temp = parseInt(parseInt(result.post_all[0].posts_all) / 10 + 1);
            var posts_all = [temp];
            for (var z = 0; z < temp; z++) {
                posts_all[z] = z + 1;
            }

            var posts = {
                options: options,
                posts: result.post,
                posts_all: posts_all,
                posts_now: "1",
                posts_type: "/" + ctx.params.page,
                post_tag: result.tag,
                post_category: result.category,
                friendly_link: result.friendly_link
            };

            ctx.render('list', posts);
        }
    });
};


export var list = (ctx) =>{
    return model_list(ctx).then((result) => {
        if (result.length == 0) {
            ctx.throw(404, '未找该页面或没有任何文章内容!');
        } else {
            for (var a = 0; a < result.post.length; a++) {
                result.post[a].post_content = setString(result.post[a].post_content.replace(/<[^>]+>/g, ""), 200);//去掉所有的html标记
            }

            var options = "{";
            for (var n = 0; n < result.options.length; n++) {
                options = options + "\"" + result.options[n].option_name + "\":\"" + result.options[n].option_value + "\"";
                if (n < result.options.length - 1) {
                    options = options + ",";
                }
            }
            options = JSON.parse(options + "}");

            var temp = parseInt(parseInt(result.post_all[0].posts_all) / 10 + 1);
            var posts_all = [temp];
            for (var z = 0; z < temp; z++) {
                posts_all[z] = z + 1;
            }

            var posts = {
                options: options,
                posts: result.post,
                posts_all: posts_all,
                posts_now: ctx.params.num,
                posts_type: "/" + ctx.params.page,
                post_tag: result.tag,
                post_category: result.category,
                friendly_link: result.friendly_link
            };

            ctx.render('list', posts);
        }
    });
};