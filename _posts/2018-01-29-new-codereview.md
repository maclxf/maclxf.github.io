---
layout: post
title: "2018-01-29周会"
date: 2018-01-29 23:22:20 +0800
description: 2018-01-29周会。 # Add post description (optional)
img:  2018-01-29.png # Add image post (optional)
list_img:  2018-01-29-list.gif
tags: [week meeting] # add tag
---
## 上周codereview执行结果回馈
1. 待优化代码
```
//异步获取云仓操作明细
public function business_list() {
    $page = $this->input->post('page') ? $this->input->post('page') : 1;
    $category = $this->input->post('category');
    $clerk_id = $this->_current_clerk['id'];
    $limit = 5;
    $data = array();
    $date = '';
    $count_array = array();
    switch ($category) {
        case 'collect' :
            $type = '205';
            $transfer = $this->warehousex->clerk_transfer_collect($clerk_id, $limit, $page);
            if ($transfer) {
                foreach($transfer as $k => $v) {
                    if (format_date($v->collect_date, 'd') != $date) {
                        $date = format_date($v->collect_date, 'd');
                        $num = $this->warehousex->get_total_clerk_transfer_num_by_date($date, $clerk_id, $type);
                        $count_array[$date]['count'] = $num;
                        $where = array(
                            'clerk_id' => $clerk_id,
                            'type' => $type,
                            'create_date like' => "%{$date}%"
                        );
                        $earn = $this->warehousex->get_clerk_earn_by_condition($where);
                        $count_array[$date]['earn'] = $earn;
                    }
                }
            }
            break;
        case 'input' :
            $type = '210';
            $transfer = $this->warehousex->clerk_transfer_inputs($clerk_id, $limit, $page);
            if ($transfer) {
                foreach($transfer as $k => $v) {
                    if (format_date($v->storage_date, 'd') != $date) {
                        $date = format_date($v->storage_date, 'd');
                        $num = $this->warehousex->get_total_clerk_transfer_num_by_date($date, $clerk_id, $type);
                        $count_array[$date]['count'] = $num;
                        $where = array(
                            'clerk_id' => $clerk_id,
                            'type' => $type,
                            'create_date like' => "%{$date}%"
                        );
                        $earn = $this->warehousex->get_clerk_earn_by_condition($where);
                        $count_array[$date]['earn'] = $earn;
                    }
                }
            }
            break;
        case 'output' :
            $type = '300';
            $transfer = $this->warehousex->clerk_transfer_outputs($clerk_id, $limit, $page);
            if ($transfer) {
                foreach($transfer as $k => $v) {
                    if (format_date($v->output_date, 'd') != $date) {
                        $date = format_date($v->output_date, 'd');
                        $num = $this->warehousex->get_total_clerk_transfer_num_by_date($date, $clerk_id, $type);
                        $count_array[$date]['count'] = $num;
                        $where = array(
                            'clerk_id' => $clerk_id,
                            'type' => $type,
                            'create_date like' => "%{$date}%"
                        );
                        $earn = $this->warehousex->get_clerk_earn_by_condition($where);
                        $count_array[$date]['earn'] = $earn;
                    }
                }
            }
            break;
        case 'error' :
            $data = $this->warehousex->get_clerk_punishs_by_clerk_id($clerk_id, $limit, $page);
            $transfer = $data['data'];
            $count_array = $data['count_array'];
            break;
    }
    $data['data'] = $transfer;
    $data['count_array'] = $count_array;
    output($data);
    return ;
}
```

2. 待优化代码
```
abstract class BillClass{

    protected abstract function assembly_data($id);

    protected abstract function get_api_url();
}
```

3. 待优化
```
public function get_new_lable($batch_transfer) {
    //执行调用奶粉
    $this->load->library('Channels/Milk_channel');
    $gl = $this->milk_channel->get_another_lable($batch_transfer->id);
}
```


## 讨论上周遇到的问题
* edk登陆密码错误不提示的问题 `@罗鑫`
* 如何实现侧边栏在跳转后不收起 `@所有人`


## 项目进度


## 备注
* <strong style="color:red">每人周三上班交我一份年终总结（2017年的总结和2018的规划）</strong>
    * 李彬和陈喆的总结要包含EDK的内容

## 周会记录
* <a href="../assets/attchment/2018-01-29/mk_content.docx" download="2018-01-29周会记录.docx">周会记录</a>
