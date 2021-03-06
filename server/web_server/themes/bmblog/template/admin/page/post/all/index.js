var NOW_PAGE, ALL_PAGES, DATE1, ORDER_BY, ORDER_TYPE, POST_STATUS, TERM, FREQUENCY;//相对的全局变量,当前页面/总页面/开始时间/排序依据/排序类型/文章总状态/筛选分类或标签/请求次数

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
    //文章状态切换
    $('.post-all').click(function () {
        POST_STATUS = 'all';
        get_posts(NOW_PAGE);
    });

    $('.post-publish').click(function () {
        POST_STATUS = 'publish';
        get_posts(NOW_PAGE);
    });

    $('.post-draft').click(function () {
        POST_STATUS = 'draft';
        get_posts(NOW_PAGE);
    });

    $('.post-trash').click(function () {
        POST_STATUS = 'trash';
        get_posts(NOW_PAGE);
    });

    //切换页面事件
    $(".current-page").keydown(function () {
        $(this).css('width', ($(this).val().length * 6.75 + 10));
        //回车
        if (event.keyCode == 13) {
            var input_page = $(this).val();
            if (input_page > 0 && input_page <= ALL_PAGES) {
                get_posts(input_page);
            } else {
                page_waiting('最大只能输入 ' + ALL_PAGES);
            }
        }
    });

    $('.first-page').click(function () {
        if (NOW_PAGE == '1') {
            page_waiting('已经是第一页');
        } else {
            get_posts(1);
        }
    });

    $('.last-page').click(function () {
        if (NOW_PAGE == 1) {
            page_waiting('已经是第一页');
        } else {
            get_posts(NOW_PAGE - 1);
        }
    });

    $('.next-page').click(function () {
        if (NOW_PAGE == ALL_PAGES) {
            page_waiting('已经是最后一页');
        } else {
            get_posts(parseInt(NOW_PAGE) + 1);
        }
    });

    $('.final-page').click(function () {
        if (ALL_PAGES == NOW_PAGE) {
            page_waiting('已经是最后一页');
        } else {
            get_posts(ALL_PAGES);
        }
    });

    //文章排序
    var last_o;
    $('.order_by').click(function () {
        var $click_child = $(this).find('i');
        var click_class = $click_child.attr('class').split(' ');
        if (click_class[1] == 'fa-caret-down') {
            ORDER_TYPE = 'ASC';
            $click_child.attr('class', 'fa fa-caret-up ' + click_class[2]);
        } else {
            ORDER_TYPE = 'DESC';
            $click_child.attr('class', 'fa fa-caret-down ' + click_class[2]);
        }
        ORDER_BY = click_class[2];
        get_posts(NOW_PAGE);
        if (last_o != click_class[2]) {
            $('.' + last_o).attr('style', ');
        }
        $click_child.css('display', 'inline');
        last_o = click_class[2];
    });

    //文章筛选
    var filter_f = function () {
        TERM = $(this).val();
        get_posts(NOW_PAGE);
        //$(this).val(TERM);
    };
    $('.filter-all-by-category').change(filter_f);
    $('.filter-all-by-tag').change(filter_f);

};

//获取文章列表详情AJAX
var get_posts = function (post_page) {
    DATE1 = new Date();
    $.ajax({
        cache: false,
        type: 'POST',
        url: "/api/blog/posts",
        async: true,
        data: {
            api_get: 'posts',
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

                    if (result.posts_trash == 0) { //如果回收站为0,则隐藏。
                        $(".post-trash-div").hide();
                    } else {
                        $(".trash_post").text(result.posts_trash);
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

                    var post_url = '/' + result.posts[a].ID + '.html';

                    //文章状态
                    if (result.posts[a].post_status == 'publish') {
                        result.posts[a].post_status = '已发布';
                        result.posts[a].post_status_show = '';
                    } else if (result.posts[a].post_status == 'draft') {
                        result.posts[a].post_status = '草稿';
                        result.posts[a].post_status_show = '<i style="color:#383838">&nbsp;&nbsp;&nbsp;&nbsp;-草稿</i>';
                        post_url += '&preview=true';
                    } else if (result.posts[a].post_status == 'pending') {
                        result.posts[a].post_status = '等待复审';
                        result.posts[a].post_status_show = '<i style="color:#383838">&nbsp;&nbsp;&nbsp;&nbsp;-待发布</i>';
                        post_url += '&preview=true';
                    } else if (result.posts[a].post_status == 'trash') {
                        result.posts[a].post_status = '最后修改';
                        result.posts[a].post_status_show = '';
                    }

                    if (POST_STATUS != 'trash' && result.posts[a].post_status != '最后修改') {
                        body += '<tr>' +
                            '<td><input type="checkbox"></td>' +
                            '<td class="post-td"><a href="#/post/edit?post=' + result.posts[a].ID + '"><div class="post_title" style="max-width:' + title_max_width + '">' + result.posts[a].post_title + '</div>' + result.posts[a].post_status_show + '</a></br><div class="post-control"><a href="#/post/edit?post=' + result.posts[a].ID + '">编辑</a> | 快速编辑 | <a href="#/post/edit?post=' + result.posts[a].ID + '" style="color: #ff0000">移至回收站</a> | <a href="' + post_url + '" target="_blank">查看</a></div></td>' +
                            '<td><a href="#/edit/post/' + result.posts[a].ID + '" target="_blank">' + result.posts[a].display_name + '</a></td>' +
                            '<td>' + result.posts[a].post_category + '</td>' +
                            '<td>' + result.posts[a].post_tag + '</td>' +
                            '<td>' + result.posts[a].comment_count + '</td>' +
                            '<td>' + result.posts[a].post_status + '</br>' + result.posts[a].post_modified + '</td>' +
                            '</tr>';
                    } else if (POST_STATUS == 'trash' && result.posts[a].post_status == '最后修改') {
                        body += '<tr>' +
                            '<td><input type="checkbox"></td>' +
                            '<td class="post-td"><a href="#/post/edit?post=' + result.posts[a].ID + '"><div class="post_title" style="max-width:' + title_max_width + '">' + result.posts[a].post_title + '</div>' + result.posts[a].post_status_show + '</a></br><div class="post-control"><a href="#/post/edit?post=' + result.posts[a].ID + '">还原</a> | <a href="#/post/edit?post=' + result.posts[a].ID + '" style="color: #ff0000">永久删除</a></div></td>' +
                            '<td><a href="#/edit/post/' + result.posts[a].ID + '" target="_blank">' + result.posts[a].display_name + '</a></td>' +
                            '<td>' + result.posts[a].post_category + '</td>' +
                            '<td>' + result.posts[a].post_tag + '</td>' +
                            '<td>' + result.posts[a].comment_count + '</td>' +
                            '<td>' + result.posts[a].post_status + '</br>' + result.posts[a].post_modified + '</td>' +
                            '</tr>';
                    }
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