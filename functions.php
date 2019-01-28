<?php
// User regist
if (!is_admin()) {
	function deregister_script(){  // 登録解除の項目
	wp_deregister_script('jquery');
	}
	function register_script(){  // 登録の項目
		wp_register_script('jquery', '//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js', false, '3.3.1', true );
		wp_register_script('hammer', get_stylesheet_directory_uri() . '/js/hammer.min.js', array( 'jquery' ), '', true);
		wp_register_script('jq-hammer', get_stylesheet_directory_uri() . '/js/jquery.hammer.js', array( 'hammer' ), '', true);
		wp_register_script('slide-gallery', get_stylesheet_directory_uri() . '/js/slide-gallery.js', array( 'jq-hammer' ), '1.3.0', true);
	}
	function add_script() {  // 装備の項目
	deregister_script();
	register_script();
	wp_enqueue_script('jquery');
	wp_enqueue_script('hummer');
	wp_enqueue_script('jq-hummer');
	wp_enqueue_script('slide-gallery');
	}
	function add_style(){
		wp_enqueue_style('slide-gallery', get_stylesheet_directory_uri() . '/css/slide-gallery.css', array(), '1.3.0');
	}
	add_action('wp_enqueue_scripts', 'add_script');
	add_action('wp_enqueue_scripts', 'add_style');
}
?>