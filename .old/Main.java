package main;
import java.util.Scanner;
import java.util.ArrayList;
import java.util.Random;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.io.File;
import java.io.FileWriter;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;

public class Main {

    /* Append table */
    public static void AppendInt(ArrayList<Integer> lista, int elemento) {
        lista.add(elemento);
    }
    public static void AppendFloat(ArrayList<Float> lista, float elemento) {
        lista.add(elemento);
    }
    public static void AppendString(ArrayList<String> lista, String elemento) {
        lista.add(elemento);
    }
    public static void AppendBool(ArrayList<Boolean> lista, Boolean elemento) {
        lista.add(elemento);
    }


    /* Remove from table */
    public static void RemoveInt(ArrayList<Integer> lista, int elemento) {
        lista.remove(elemento);
    }
    public static void RemoveFloat(ArrayList<Float> lista, float elemento) {
        lista.remove(elemento);
    }
    public static void RemoveString(ArrayList<String> lista, String elemento) {
        lista.remove(elemento);
    }
    public static void RemoveBool(ArrayList<Boolean> lista, Boolean elemento) {
        lista.remove(elemento);
    }


    /* Table size */
    public static int TableLenInt(ArrayList<Integer> lista) {
        return lista.size();
    }
    public static int TableLenFloat(ArrayList<Float> lista) {
        return lista.size();
    }
    public static int TableLenString(ArrayList<String> lista) {
        return lista.size();
    }
    public static int TableLenBool(ArrayList<Boolean> lista) {
        return lista.size();
    }


    /* New functionalities */
    public static int TableGetInt(ArrayList<Integer> lista, int index) {
        return lista.get(index);
    }
    public static float TableGetFloat(ArrayList<Float> lista, int index) {
        return lista.get(index);
    }
    public static String TableGetString(ArrayList<String> lista, int index) {
        return lista.get(index);
    }



    /* File handling */
    public static void WriteFile(String fileName, String msg) {
        try {
            File __FileCreatorFM = new File(fileName);
            __FileCreatorFM.createNewFile();
            try {
                FileWriter __FileWriter = new FileWriter(fileName);
                __FileWriter.write(msg);
                __FileWriter.flush();
                __FileWriter.close();
              } catch (IOException e) {
                System.out.println("Error occurred during file writing.");
                e.printStackTrace();
              }

        } catch (IOException e) {
            System.out.println("Error occurred during file creation.");
            e.printStackTrace();
        }
    }
    public static void AppendFile(String fileName, String msg) {
        try {
            FileWriter __FileWriter = new FileWriter(fileName);
            __FileWriter.append(msg);
            __FileWriter.flush();
            __FileWriter.close();
        } catch (IOException e) {
            System.out.println("Error occurred during file appending.");
            e.printStackTrace();
        }
    }

    public static String ReadFile(String filename) throws IOException {
        Path filepath = Paths.get(filename);
        byte[] text = Files.readAllBytes(filepath);
        String el = new String(text);
        return el;
    }
    

    /* Generate random integer */
    public static int RandomIntValue(int seed) {
        Random __RandomNumberGenerator = new Random();
        return __RandomNumberGenerator.nextInt(seed);
    }

    /* Math Average */
    public static float MathAverage(float valsum, int valquant) {
        return valsum/valquant;
    }

public static void main(String[] args) {
System.out.println("Hello world");
String _ = "Hello";
String[] v = {"Hello","World"};
}
}
