var NOW_PAGE, ALL_PAGES, DATE1, ORDER_BY, ORDER_TYPE, POST_STATUS, TERM, FREQUENCY;//相对的全局变量,当前页面/总页面/开始时间/排序依据/排序类型/文章总状态/筛选分类或标签/请求次数

//载入js、CSS文件
var simplemde_JS = "/assets/js/admin/simplemde.min.js";//js文件路径
var simplemde_CSS = "/assets/css/admin/simplemde.min.css";//CSS文件路径
if ($('#other_js').length == 0) {
    $('head').append('<link rel="stylesheet" href="' + simplemde_CSS + '">');
    $('.container').after('<script src="' + simplemde_JS + '" id="other_js"></script>');
}

//页面载入完成计算
var finish_load = function () {
    var date2 = new Date();
    $('#e_time').text(date2.getTime() - DATE1.getTime());
    $('#r_time').text(new Date().Format("yyyy-MM-dd hh:mm:ss"));
};

//页面警告
var page_waiting = function (str) {
    var $page_waiting = $('.page-waiting');
    var width = '-' + parseInt($page_waiting.css('width')) / 2 + 'px';
    $page_waiting.text(str).css('margin-left', width).show();
    setTimeout(function () {
        $('.page-waiting').fadeOut(500);
    }, 1000);
};

//注册事件
var register_event = function () {
    //tag隐藏
    var tmp4 = 1;
    $('.tag-caret').click(function () {
        var $tag = $(this).parent().parent();
        if (tmp4 == 1) {

            $tag.find('.tag-content').slideUp(200, function () {
                $tag.find('.tag-title').css('border-bottom', '0px');
            });
            $(this).find('i').attr('class', 'fa fa-caret-up');
            tmp4 = 0;
        } else {
            $tag.find('.tag-content').slideDown(200, function () {
                $tag.find('.tag-title').css('border-bottom', '1px solid #eef1f5');
            });
            $(this).find('i').attr('class', 'fa fa-caret-down');
            tmp4 = 1;
        }
    });
};

//载入编辑器
var simplemde = new SimpleMDE({ element: document.getElementById("edit") });

//获取文章列表详情AJAX
var get_posts = function (post_page) {
    DATE1 = new Date();
    $.ajax({
        cache: false,
        type: 'POST',
        url: "/api/blog/posts",
        async: true,
        data: {
            api_get: 'post',
            post_page: post_page,
            post_status: POST_STATUS,
            term: TERM,
            order_by: ORDER_BY,
            order_type: ORDER_TYPE
        },
        dataType: "json",
        success: function (result) {
            if (result.err == 500) {
                $("#main").html('<h1>数据错误</h1>');
            } else {
                ALL_PAGES = result.posts_page_all;
                NOW_PAGE = result.posts_now;

                //仅查询一次
                if (FREQUENCY == 1) {
                    //处理统计
                    $(".all_post").text(result.posts_publish + result.posts_draft);
                    $(".public_post").text(result.posts_publish);
                    if (result.posts_draft == 0) { //如果草稿为0,则隐藏。
                        $(".post-draft-div").hide();
                    } else {
                        $(".draft_post").text(result.posts_draft);
                    }
                    $(".all_page").text(ALL_PAGES);

                    //处理日期归组
                    var date_g = result.posts_date_group;
                    var html_date = '';
                    for (var z = 0; z < date_g.length; z++) {
                        html_date += '<option value="' + date_g[z].posts_date_gourp.replace('年', '') + '">' + date_g[z].posts_date_gourp + ' (' + date_g[z].cnt + ')</option>';
                    }
                    $('.filter-by-date').html('<option selected="selected" value="all">全部日期</option>' + html_date);//不能用append。

                    //处理所有文章分类和标签
                    $('.filter-all-by-category').html('<option selected="selected" value="all">全部分类目录</option>');
                    $('.filter-all-by-tag').html('<option selected="selected" value="all">全部文章标签</option>');
                    for (var s = 0; s < result.posts_all_terms.length; s++) {
                        if (result.posts_all_terms[s]['parent'] != '0') {
                            result.posts_all_terms[s].name = '&nbsp;&nbsp;&nbsp;' + result.posts_all_terms[s].name;
                        }
                        if (result.posts_all_terms[s].taxonomy == 'category') {
                            $('.filter-all-by-category').append('<option value="' + result.posts_all_terms[s].term_id + '">' + result.posts_all_terms[s].name + '</option>');
                        } else {
                            $('.filter-all-by-tag').append('<option value="' + result.posts_all_terms[s].term_id + '">' + result.posts_all_terms[s].name + '</option>');
                        }
                    }
                }

                //处理所有文章分类和标签
                $('.filter-by-category').html('<option selected="selected" value="all">分类目录</option>');
                $('.filter-by-tag').html('<option selected="selected" value="all">文章标签</option>');
                for (var s = 0; s < result.posts_terms.length; s++) {
                    if (result.posts_terms[s]['parent'] != '0') {
                        result.posts_terms[s].name = '&nbsp;&nbsp;&nbsp;' + result.posts_terms[s].name;
                    }
                    if (result.posts_terms[s].taxonomy == 'category') {
                        $('.filter-by-category').append('<option value="' + result.posts_terms[s].term_id + '">' + result.posts_terms[s].name + '</option>');
                    } else {
                        $('.filter-by-tag').append('<option value="' + result.posts_terms[s].term_id + '">' + result.posts_terms[s].name + '</option>');
                    }
                }

                //处理文章列表
                $(".current-page").val(NOW_PAGE).css('width', NOW_PAGE.length * 6.75 + 10);
                var title_max_width = parseInt($('.main').css('width')) * 0.45 + 'px';
                var body = '';
                for (var a = 0; a < result.posts.length; a++) {
                    //分类
                    if (result.posts[a].post_category == null) {
                        result.posts[a].post_category = '-';
                    } else {
                        result.posts[a].post_category = result.posts[a].post_category.split(',');
                        for (var b = 0; b < result.posts[a].post_category.length; b++) {
                            result.posts[a].post_category[b] = '<a href="/' + result.posts[a].post_category[b] + '" target="_blank">' + result.posts[a].post_category[b] + '</a>';
                        }
                    }

                    //标签
                    if (result.posts[a].post_tag == null) {
                        result.posts[a].post_tag = '-';
                    } else {
                        result.posts[a].post_tag = result.posts[a].post_tag.split(',');
                        for (var c = 0; c < result.posts[a].post_tag.length; c++) {
                            result.posts[a].post_tag[c] = '<a href="/tag/' + result.posts[a].post_tag[c] + '" target="_blank">' + result.posts[a].post_tag[c] + '</a>';
                        }
                    }

                    //评论
                    if (result.posts[a].comment_count < 10) {
                        result.posts[a].comment_count = '&nbsp;&nbsp;&nbsp;' + result.posts[a].comment_count;
                    } else if (result.posts[a].comment_count < 100) {
                        result.posts[a].comment_count = '&nbsp;&nbsp;' + result.posts[a].comment_count;
                    }

                    //文章状态
                    if (result.posts[a].post_status == 'publish') {
                        result.posts[a].post_status = '已发布';
                        result.posts[a].post_status_show = '';
                    } else if (result.posts[a].post_status == 'draft') {
                        result.posts[a].post_status = '草稿';
                        result.posts[a].post_status_show = '<i style="color:#383838">&nbsp;&nbsp;&nbsp;&nbsp;-草稿</i>';
                    }

                    body += '<tr>' +
                        '<td><input type="checkbox"></td>' +
                        '<td class="post-td"><a href="#/edit/post/' + result.posts[a].ID + '" target="_blank"><div class="post_title" style="max-width:' + title_max_width + '">' + result.posts[a].post_title + '</div>' + result.posts[a].post_status_show + '</a></br><div class="post-control">编辑 | 快速编辑 | 移至回收站 | 查看</div></td>' +
                        '<td><a href="#/edit/post/' + result.posts[a].ID + '" target="_blank">' + result.posts[a].display_name + '</a></td>' +
                        '<td>' + result.posts[a].post_category + '</td>' +
                        '<td>' + result.posts[a].post_tag + '</td>' +
                        '<td>' + result.posts[a].comment_count + '</td>' +
                        '<td>' + result.posts[a].post_status + '</br>' + result.posts[a].post_date + '</td>' +
                        '</tr>';
                }
                $('.filter-all').text(result.posts_now_all);
                $("tbody").html(body);
                FREQUENCY++;
                finish_load();
            }
        },
        error: function (err) {
            $("#main").html('<h1>' + err.responseText + '(' + err.status + ')' + '</h1>');
            console.log(err);
        }
    });
};

//初始化变量、函数
TERM = 'all';
POST_STATUS = 'all';
ORDER_BY = 'date';
ORDER_TYPE = 'DESC';
FREQUENCY = 1;
get_posts(1);
register_event();