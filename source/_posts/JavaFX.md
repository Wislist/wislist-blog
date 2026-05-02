---
title: "JavaFX"
date: 2024-06-20 00:00:00
tags: []
categories: []
---

### JavaFX

#### `Application` 类

这是主启动类，是必修实现的`javafx.application.Application` 抽象类。
[code] 
    public class HelloApplication extends Application {    @Override    public void start(Stage stage) throws IOException {        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("hello-view.fxml"));        Scene scene = new Scene(fxmlLoader.load(), 320, 240);        stage.setTitle("Hello!");        stage.setScene(scene);        stage.show();    }    public static void main(String[] args) {        launch();    }}
[/code]

**实现start()**方法

`start()` 方法有一个 `Stage`（舞台）类型的形参。该 `Stage` 类型的参数是显示 JavaFX 应用程序的所有可视部分的地方。`Stage` 对象由 JavaFX 运行时（JavaFX runtime）自动为您创建。

如果您不对 `Stage` 对象调用 `show()`，则什么都看不到且没有打开任何窗口。如果您的 JavaFX 应用程序在启动时不可见，请检查您是否记得从 `start()` 方法内部调用 `Stage` 对象的 `show()` 方法。

#### Button
[code]
    package com.wislist.chatsocket;import javafx.application.Application;import javafx.fxml.FXMLLoader;import javafx.scene.Scene;import javafx.scene.control.Button;import javafx.scene.control.Label;import javafx.scene.image.Image;import javafx.scene.layout.HBox;import javafx.stage.Stage;import java.io.IOException;public class HelloApplication extends Application {    @Override    public void start(Stage stage) throws IOException {//        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("hello-view.fxml"));//        Scene scene = new Scene(fxmlLoader.load(), 320, 240);//        Label label = new Label("hello world!");//        Button button = new Button("start");//        Scene scene = new Scene(label, 640, 360);//        Scene scene_button = new Scene(button, 100, 200);//        button.setDefaultButton(true);//        button.setText("nm");//        stage.setTitle("ChatSocket");//        stage.getIcons().add(new Image("D:\\ChatSocket\\ChatSocket\\src\\main\\resources\\imgs\\stage1.png")); 图标设置 logo//        stage.setScene(scene);        /**         * @TODO: CSS样式 BUTTON         */        Button button1 = new Button("Button 1");        Button button2 = new Button("Button 2");        Button button3 = new Button("Button 3");        Button button4 = new Button("Button 4");        button1.setStyle("-fx-border-color: #ff0000; -fx-border-width: 5px;");        button2.setStyle("-fx-background-color: #00ff00");        button3.setStyle("-fx-font-size: 2em; ");        button4.setStyle("-fx-text-fill: #0000ff");        HBox hbox = new HBox(button1, button2, button3, button4);        Scene scene = new Scene(hbox, 400, 100);        stage.setScene(scene);        stage.show();//        stage.setScene(scene_button);//        stage.show();    }    public static void main(String[] args) {        launch();    }}
[/code]