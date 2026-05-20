package util;

import java.util.Scanner;

public class InputHelper {

    public static int readInt(Scanner input) {
        while (true) {
            try {
                return Integer.parseInt(input.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Input harus berupa angka bulat: ");
            }
        }
    }

    public static double readDouble(Scanner input) {
        while (true) {
            try {
                return Double.parseDouble(input.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Input harus berupa angka/desimal: ");
            }
        }
    }
}