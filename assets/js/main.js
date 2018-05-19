
$(function(){
    $('#show_action').click(function(e) {
        e.preventDefault();
        $('#show_content').slideDown("slow");
    });

    $('.click_me').click(function(e) {
    	e.preventDefault();

    	var show_where = $(this).data("show_where");
    	$('#' + show_where).slideDown("slow");
    })



});