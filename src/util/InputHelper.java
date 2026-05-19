package util;

import java.util.Scanner;

public class InputHelper {

    // INPUT INTEGER
    public static int readInt(Scanner input) {
        while (true) {
            try {
                return Integer.parseInt(input.nextLine());
            } catch (NumberFormatException e) {
                System.out.print("Input harus berupa angka bulat: ");
            }
        }
    }

    // INPUT DOUBLE
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