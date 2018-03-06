---
layout: post
title: "2018-03-05周会"
date: 2018-03-05 23:22:20 +0800
description:  代码重构（代码的坏味道） # Add post description (optional)
img:  2018-03-05.jpg # Add image post (optional)
list_img:  2018-03-05-list.jpg
tags: ['week meeting', '代码重构', '过长的参数列']# add tag
---
## 上周codereview执行结果回馈
* 【代码的坏味道】 过长的参数列
> 刚开始学编程的时候，或许都是“把函数所需的所有东西都以参数传递进去”。这样也是可以理解的，因为除此之外就只能选择全局数据，而全局数据是邪恶的东西。对象技术告诉我们，如果你手上没有所需的东西，总可以叫一个对象给你。有了对象，你就不必要把函数所需的所有东西都以参数传递给它，<strong>只需传给它足够的、让函数能从中获得自己的东西就行</strong>。
太长的的参数列难以理解，太多参数会造成前后不一致、不易使用，而且一旦需要更多数据，就不得不修改它。如果将对象传递给函数，大多数修改都将没有必要，因为很可能只需增加一两条请求，就能得到更多的数据。

```php
public function virement($notice, $type = 'customer', $id, $category, $key, $amount, $password) {
    if(empty($type)) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '当前用户类型获取失败', false);
    }
    if((int)$id <= 0) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '当前用户信息获取失败', false);
    }
    if(empty($category)) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '对方账户类型获取失败', false);
    }
    if(empty($key)) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '对方账户不能为空', false);
    }
    if(empty($amount)) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '请输入转账金额', false);
    }
    if((float)$amount <= 0) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '转账金额必须大于0.00', false);
    }
    if(!$password) {
        return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '支付密码不能为空', false);
    }
    $template = C('template', 'template');
    $detail_url = C('template', 'detail_url');
    //如果转账主体是用户
    if($type == 'customer') {
        //转账主体数据
        $customer_from_account = $this->CI->account_model->get_customer_account($id);
        $customer = $this->CI->customer_model->get($id);
        //验证支付密码
        if($customer->pay_password !== encrypt_pswd($password, $customer->pay_salt)) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '支付密码错误', false);
        }
        if($customer_from_account->usable_money < $amount) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '当前余额不足', false);
        }
        $where = '`name` = "' . $key . '" or phone = "' . $key . '" or email = "' . $key . '"';
        $to_customer = $this->CI->customer_model->get_by($where, '*');
        if(empty($to_customer)) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '指定用户不存在', false);
        }
        $result = $this->CI->account_model->virement($type, $category, $id, $to_customer->id, $amount);
        if($result === false) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '转账失败', false);
        } else {
            //给转账人发送转账成功通知
            $transfer_success_notice = $template['transfer_success_notice'];
            $userId = $customer->openid;
            $url = $detail_url . 'package/balance';
            $template_id = $transfer_success_notice['template_id'];
            $data['amount']['value'] = $amount . '€';
            $data['money']['value'] = $customer_from_account->usable_money - $amount . '€';
            $data['ad']['value'] = '';
            $result = $notice->uses($template_id)->withUrl($url)->andData($data)->andReceiver($userId)->send();
            //给收账人发送收账充值成功通知
            $recharge_success_notice = $template['recharge_success_notice'];
            $receiver_template_id = $recharge_success_notice['template_id'];
            $receiver_user_id = $to_customer->openid;
            $receiver_url = $detail_url . 'package/balance';
            $receiver_data['amount']['value'] = $amount . '€';
            $receiver_data['ad']['value'] = '';
            $result = $notice->uses($receiver_template_id)->withUrl($receiver_url)->andData($receiver_data)->andReceiver($receiver_user_id)->send();
            return build_response(Response::SUCCESS, Response::CODE_OK, '转账成功', true);
        }
    }
    //如果转账主体是小站人员
    if($type == 'merchant_user') {
        //转账主体数据
        $merchant_user = $this->CI->merchant_user_model->get($id);
        //验证支付密码
        if($merchant_user->draw_password !== encrypt_pswd($password, $merchant_user->draw_salt)) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '支付密码错误', false);
        }
        $merchant_user_from_account = $this->CI->merchant_user_model->get_merchant_user_account($id);
        if($merchant_user_from_account->usable_amount < $amount) {
            return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '当前余额不足', false);
        }

        $transfer_amount = $merchant_user_from_account->usable_amount - $amount;
        //给小站人员发送模版消息
        $merchant_transfer_success_notice = $template['merchant_transfer_success_notice'];
        $template_id = $merchant_transfer_success_notice['template_id'];
        $userId = $merchant_user->openid;
        $url = site_url('package/balance');
        $data['amount']['value'] = $amount . '€';
        $data['money']['value'] = $transfer_amount . '€';
        $data['ad']['value'] = '';

        //如果入账主体是用户
        if($category == 'customer') {
            //入账主体数据
            $where = '`name` = "' . $key . '" or phone = "' . $key . '" or email = "' . $key . '"';
            $to_customer = $this->CI->customer_model->get_by($where, '*');
            if(empty($to_customer)) {
                return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '指定用户不存在', false);
            }
            $result = $this->CI->account_model->virement($type, $category, $id, $to_customer->id, $amount);
            if($result === false) {
                return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '转账失败', false);
            } else {
                $data['name']['value'] = $to_customer->name;
                $result = $notice->uses($template_id)->withUrl($url)->andData($data)->andReceiver($userId)->send();
                //准备用户发送模板消息要用到的json数据
                $recharge_success_notice = $template['recharge_success_notice'];
                $recharge_success_notice['userId'] = $to_customer->openid;
                $recharge_success_notice['url'] = $detail_url . 'member/balance';
                $recharge_success_notice['data']['amount']['value'] = $amount . '€';
                $recharge_success_notice['data']['ad']['value'] = '';
                $recharge_success_notice_json = json_encode(array($recharge_success_notice));
                return build_response(Response::SUCCESS, Response::CODE_OK, '转账成功', $recharge_success_notice_json);
            }
        }
        //如果入账主体是小站员工
        if($category == 'merchant_user') {
            //入账主体数据
            $where = '`name` = "' . $key . '" or phone = "' . $key . '" or email = "' . $key . '"';
            $to_merchant_user = $this->CI->merchant_user_model->get_merchant_user($where);
            if(empty($to_merchant_user)) {
                return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '指定用户不存在', false);
            }
            $result = $this->CI->account_model->virement($type, $category, $id, $to_merchant_user->id, $amount);
            if($result === false) {
                return build_response(Response::FAILED, Response::CODE_BAD_REQUEST, '转账失败', false);
            } else {
                $data['name']['value'] = $to_merchant_user->name;
                $result = $notice->uses($template_id)->withUrl($url)->andData($data)->andReceiver($userId)->send();
                //小站用户充值成功通知
                $merchant_recharge_success_notice = $template['merchant_recharge_success_notice'];
                $receiver_template_id = $merchant_recharge_success_notice['template_id'];
                $receiver_user_id = $to_merchant_user->openid;
                $receiver_url = site_url('package/balance');
                $receiver_data['amount']['value'] = $amount . '€';
                $receiver_data['ad']['value'] = '';
                $result = $notice->uses($receiver_template_id)->withUrl($receiver_url)->andData($receiver_data)->andReceiver($receiver_user_id)->send();
                return build_response(Response::SUCCESS, Response::CODE_OK, '转账成功', false);
            }
        }
    }
}
```


## 分享
* 分享内容
* 上周代码遇到的问题
    * 调整了Js和css文件的代码，会有缓存的问题需要强制刷新文件，或者在文件路径的url后加参数以强制浏览器获取

> 遇到大坑小坑常做记录，周会分享，大家学习，共同进步

## 项目进度
* EDK: 本周完成正式环境线上的内部测试以及bug的修改
* FR： 3月7号前完成用户价格设置的修改

> 会前整理好本周的工作，体现出可实施性。


## 周会记录
* <a href="../assets/attchment/2018-03-05/mk_content.docx" download="周会记录.docx">周会记录</a>


## 备注
* 月会安排在下周，讨论绩效
* 每人整理自己的绩效个人发展部分




