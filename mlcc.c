/*
 *
 * mlcc - Machine Learning Container Creator
 * Copyright (C) 2017 Red Hat Inc
 *  - Bill Gray (bgray@redhat.com)
 *
 * mlcc is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; version 2.1.
 *
 * mlcc is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 *
 * You should find a copy of v2.1 of the GNU Lesser General Public License
 * somewhere on your Linux system; if not, write to the Free Software Foundation,
 * Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *
 *
 * */ 


//
// To build for GUI:  yum install gnome-devel-docs gtk+ gtk3-devel gtk3-devel-docs gtk+-devel gtk-doc libcanberra-gtk3
//
// Compile with:  gcc -std=gnu99 -g -Wall -o mlcc mlcc.c
// For GUI with:  gcc -std=gnu99 -g -Wall -o mlcc mlcc.c -DGUI `pkg-config --cflags gtk+-3.0` `pkg-config --libs gtk+-3.0`
//


#include <assert.h>
#include <ctype.h>
#include <dirent.h>
#include <errno.h>
#include <getopt.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>


int gui = 0;
int debug = 0;
int quiet = 0;
int verbose = 0;
int interactive = 0;
int output_script_instead_of_dockerfile = 0;
char *prog_name = NULL;
char *list_delimiters = " \t\n,";
char *output_file_name = NULL;
char *title_string = "Machine Learning Container Creator";
char *version_string = "20181224a";


void display_version_and_exit() {
    printf("%s version: %s: %s\n", prog_name, version_string, __DATE__);
    exit(EXIT_SUCCESS);
}


void display_usage_and_exit() {
    fprintf(stderr, "-d to turn on debugging output\n");
    fprintf(stderr, "-G to use the GUI selection interface\n");
    fprintf(stderr, "-h to see this usage help message\n");
    fprintf(stderr, "-i <pkg>,<pkg>... to generate a dockerfile with specified pkgs\n");
    fprintf(stderr, "-I to use the interactive selection interface\n");
    fprintf(stderr, "-l to see a display of all pkg names\n");
    fprintf(stderr, "-o <output file name> to set output file name\n");
    fprintf(stderr, "-q to turn on quiet mode\n");
    fprintf(stderr, "-s to output shellscript instead of dockerfile\n");
    fprintf(stderr, "-t <text> to set the GUI window title string\n");
    fprintf(stderr, "-V to show the %s code version\n", prog_name);
    fprintf(stderr, "-v to turn on verbose mode\n");
    exit(EXIT_FAILURE);
}


#define MAX_NUM_FRAGS 1000
#define MLCC_FRAG_DIR_NAME "MLCC_Frags"

char path_buf[4096] = MLCC_FRAG_DIR_NAME;


struct frag_data {
    char *label;
    char *fpath;
    ino_t inode_num;
    uint16_t po_num;
    uint8_t d_type;
    union {
        uint8_t selected;
        uint8_t exclusive;
    } flag;
    struct frag_data *parent;
} frags[MAX_NUM_FRAGS];

int num_frags = 0;


struct frag_data *selected_set[MAX_NUM_FRAGS];
struct frag_data *available_set[MAX_NUM_FRAGS];
int num_selected = 0;
int num_available = 0;


void list_all_packages() {
    for (int ix = 0;  (ix < num_frags);  ix++) {
        printf("(%d) %-20s %s ", frags[ix].po_num, frags[ix].label, frags[ix].fpath);
        if (debug) {
            printf("inode: %ld d_type: %d exclusive: %d ", frags[ix].inode_num, frags[ix].d_type, frags[ix].flag.exclusive );
            if (frags[ix].parent) { printf("Parent: %s ", frags[ix].parent->label); }
        }
        printf("\n");
    }
}


void display_set(char *title, struct frag_data **set, int *num, int lo_po_num_start, int hi_po_num_limit) {
    struct winsize win_info;
    ioctl(0, TIOCGWINSZ, &win_info);
    // printf ("lines %d\n", win_info.ws_row);
    // printf ("columns %d\n", win_info.ws_col);
    printf("\n%s:\n", title);
    int line_length = 0;
    for (int ix = 0;  (ix < *num);  ix++) {
        if ((set[ix]->po_num >= lo_po_num_start) && (set[ix]->po_num < hi_po_num_limit)) {
            printf("%2d: %-20s", ix, set[ix]->label);
            line_length += 24;
            if (line_length +24  > win_info.ws_col) {
                line_length = 0;
                printf("\n");
            }
        }
    }
    printf("\n");
}


void sort_set_by_label_and_remove_duplicates(struct frag_data **set, int *num) {
    int n = *num;
    for (int ix = 0;  (ix < n);  ix++) {
        for (int iy = ix + 1;  (iy < n);  iy++) {
            int different = strcasecmp(set[iy]->label, set[ix]->label);
            if (!different) {
                set[iy] = set[(n - 1)];
                n -= 1;
                iy -= 1;
                continue;
            } else if (different < 0) {
                struct frag_data *p = set[ix];
                set[ix] = set[iy];
                set[iy] = p;
            }
        }
    }
    *num = n;
}


void sort_set_by_po_num(struct frag_data **set, int *num) {
    int n = *num;
    for (int ix = 0;  (ix < n);  ix++) {
        for (int iy = ix + 1;  (iy < n);  iy++) {
            int swap = 0;
            if (set[iy]->po_num < set[ix]->po_num) {
                swap = 1;
            } else if (set[iy]->po_num == set[ix]->po_num) {
                swap = (strcasecmp(set[iy]->label, set[ix]->label) < 0);
            }
            if (swap) {
                struct frag_data *p = set[ix];
                set[ix] = set[iy];
                set[iy] = p;
            }
        }
    }
    *num = n;
}


void add_to_set(struct frag_data *p, struct frag_data **set, int *n) {
    set[*n] = p;
    *n += 1;
}


void partition_selected() {
    num_selected = 0;
    num_available = 0;
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if (frags[ix].d_type != DT_DIR) {
            if (frags[ix].flag.selected) {
                add_to_set(&(frags[ix]), selected_set, &num_selected);
            } else {
                add_to_set(&(frags[ix]), available_set, &num_available);
            }
        }
    }
    sort_set_by_label_and_remove_duplicates(selected_set, &num_selected);
    sort_set_by_po_num(selected_set, &num_selected);
    sort_set_by_label_and_remove_duplicates(available_set, &num_available);
    sort_set_by_po_num(available_set, &num_available);
}


void mark_selection(char *s, int yes_or_no) {
    int tokens_found = 0;
    if (debug) {
        printf("Marking %s as included: %d\n", s, yes_or_no);
    }
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if (!strcasecmp(s, frags[ix].label)) {
            frags[ix].flag.selected = yes_or_no;
            num_selected += yes_or_no;
            tokens_found += 1;
            if (debug) {
                printf("Marking pkg: %s as %d\n", frags[ix].label, yes_or_no);
            }
        }
    }
    if (!tokens_found) {
        fprintf(stderr, "Token %s not found\n", s);
    }
}


void clear_all_selections_in_po_num_group(int po_num) {
    int lo = 100 * (po_num / 100);
    int hi = 100 * ((po_num + 99) / 100);
    if (debug) {
        printf("Clearing all between %d and %d\n", lo, hi);
    }
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((frags[ix].d_type != DT_DIR) && (frags[ix].po_num >= lo) && (frags[ix].po_num < hi)) {
            frags[ix].flag.selected = 0;
        }
    }
}


int label_to_ix(char *s) {
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if (!strcasecmp(s, frags[ix].label)) {
            return ix;
        }
    }
    return -1;
}


int selected(char *s) {
    if (debug) {
        printf("Checking to see if %s is selected\n", s);
    }
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((frags[ix].d_type != DT_DIR) && (!strcasecmp(s, frags[ix].label))) {
            return frags[ix].flag.selected;
        }
    }
    return 0;
}


int selected_strn(char *s, int n) {
    int result = 0;
    if (debug) {
        printf("Checking to see if first %d characters of %s are selected\n", n, s);
    }
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((debug) && (frags[ix].flag.selected)) {
            printf("%s is selected (or exclusive dir): %d\n", frags[ix].label, frags[ix].flag.selected);
        }
        if ((frags[ix].d_type != DT_DIR) && (!strncasecmp(s, frags[ix].label, n))) {
            result |= frags[ix].flag.selected;
        }
    }
    return result;
}


void check_compatibility_and_add(char *s, int sel_value) {
    int ix = label_to_ix(s);
    if (ix < 0) {
        fprintf(stderr, "Cannot find label: %s\n", s);
        exit(EXIT_FAILURE);
    }
    int po_num = frags[ix].po_num;
    if (debug) {
        printf("Checking compatibility before adding of %s (%d), level %d\n", s, sel_value, po_num);
    }
    if ((frags[ix].parent) && (frags[ix].parent->flag.exclusive)) {
        clear_all_selections_in_po_num_group(po_num);
    }
    // Scan associated file and recursively check any REQUIRE targets
    FILE *ff = fopen(frags[ix].fpath, "r");
    if (!ff) {
        fprintf(stderr, "Could not read file: %s\n", frags[ix].fpath);
        exit(EXIT_FAILURE);
    }
    while (!feof(ff)) {
        char buf[512];
        fgets(buf, sizeof(buf), ff);
        char *p = strstr(buf, "REQUIRE ");
        if (p == buf) {
            char *p_context;
            p = strtok_r(&(buf[8]), list_delimiters, &p_context);
            while (p) {
                check_compatibility_and_add(p, sel_value + 1);
                p = strtok_r(NULL, list_delimiters, &p_context);
            }
        }
    }
    fclose(ff);
    mark_selection(s, sel_value);
}


#ifdef GUI

#include <gtk/gtk.h>
#include <glib.h>

int num_buttons = 0;
GtkWidget *buttons[MAX_NUM_FRAGS];

void handle_select_event(GtkWidget *widget, GdkEventExpose *event, gpointer data) {
    char *button_label = (char *)gtk_button_get_label(GTK_BUTTON(widget));
    if (gtk_toggle_button_get_active(GTK_TOGGLE_BUTTON(widget))) {
        check_compatibility_and_add(button_label, 1);
        for (int ix = 0;  (ix < num_buttons);  ix++) {
            int selected_state = (selected((char *)gtk_button_get_label(GTK_BUTTON(buttons[ix]))) > 0);
            gtk_toggle_button_set_active(GTK_TOGGLE_BUTTON(buttons[ix]), selected_state);
        }
    } else {
        mark_selection((char *)button_label, 0);
    }
}

void add_button(GtkWidget *b) {
    buttons[num_buttons++] = b;
    g_signal_connect(b, "clicked", G_CALLBACK(handle_select_event), NULL);
}

void handle_reset_event(GtkWidget *widget, GdkEventExpose *event, gpointer data) {
    for (int ix = 0;  (ix < num_buttons);  ix++) {
        gtk_toggle_button_set_active(GTK_TOGGLE_BUTTON(buttons[ix]), 0);
        mark_selection((char *)gtk_button_get_label(GTK_BUTTON(buttons[ix])), 0);
    }
}

static gboolean check_all_the_buttons(void) {
    for (int ix = 0;  (ix < num_buttons);  ix++) {
        if (gtk_toggle_button_get_active(GTK_TOGGLE_BUTTON(buttons[ix]))) {
            check_compatibility_and_add((char *)gtk_button_get_label(GTK_BUTTON(buttons[ix])), 1);
        }
    }
    gtk_main_quit();
    return(FALSE);
} 

static gboolean handle_create_shell_script_button(GtkWidget *widget, GdkEventExpose *event, gpointer data) {
    output_script_instead_of_dockerfile = 1;
    return(check_all_the_buttons());
} 

static gboolean handle_create_dockerfile_button(GtkWidget *widget, GdkEventExpose *event, gpointer data) {
    output_script_instead_of_dockerfile = 0;
    return(check_all_the_buttons());
} 

static gboolean handle_destroy_event(GtkWidget *widget, GdkEventExpose *event, gpointer data) {
    gtk_main_quit();
    exit(EXIT_SUCCESS);
}


void make_gui_choices() {
    GtkWidget *window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_title(GTK_WINDOW(window), title_string);
    gtk_window_set_position(GTK_WINDOW(window), GTK_WIN_POS_CENTER);
    g_signal_connect(G_OBJECT(window), "destroy", G_CALLBACK(handle_destroy_event), NULL);
    // gtk_window_set_decorated(GTK_WINDOW(window), show_window_decorations);
    // gtk_window_set_default_size(GTK_WINDOW(window), panel_width, panel_height);
    // gtk_container_set_border_width(GTK_CONTAINER(window), 10);
    GtkWidget *big_box = gtk_box_new(GTK_ORIENTATION_VERTICAL, 0);
    gtk_box_set_homogeneous(GTK_BOX(big_box), FALSE);
    gtk_container_add(GTK_CONTAINER(window), big_box);
    num_available = 0;
    for (int ix = 0;  (ix < num_frags);  ix++) {
        add_to_set(&(frags[ix]), available_set, &num_available);
    }
    sort_set_by_po_num(available_set, &num_available);
    for (int ix = 0;  (ix < num_available); ) {
        GtkWidget *flow_box = gtk_flow_box_new();
        gtk_flow_box_set_min_children_per_line((GtkFlowBox *)flow_box, 3);
        gtk_flow_box_set_max_children_per_line((GtkFlowBox *)flow_box, 6);
        gtk_box_pack_start(GTK_BOX(big_box), flow_box, TRUE, TRUE, 0);
        if ((available_set[ix]->d_type == DT_DIR) && (available_set[ix]->flag.exclusive)) {
            GtkWidget *button = NULL;
            struct frag_data *parent_dir = available_set[ix++];
            while ((ix < num_available) && (available_set[ix]->parent) && (available_set[ix]->parent == parent_dir)) {
                if (!(button)) {
                    button = gtk_radio_button_new_with_label(NULL, available_set[ix]->label);
                } else {
                    button = gtk_radio_button_new_with_label_from_widget(GTK_RADIO_BUTTON(button), available_set[ix]->label);
                }
                add_button(button);
                gtk_flow_box_insert((GtkFlowBox *)flow_box, button, -1);
                ix += 1;
            }
        } else if (available_set[ix]->d_type == DT_DIR) {
            struct frag_data *parent_dir = available_set[ix++];
            while ((ix < num_available) && (available_set[ix]->parent) && (available_set[ix]->parent == parent_dir)) {
                GtkWidget *button = gtk_check_button_new_with_label(available_set[ix++]->label);
                add_button(button);
                gtk_flow_box_insert((GtkFlowBox *)flow_box, button, -1);
            }
        } else { 
            while ((ix < num_available) && (available_set[ix]->d_type != DT_DIR)) {
                GtkWidget *button = gtk_check_button_new_with_label(available_set[ix++]->label);
                add_button(button);
                gtk_flow_box_insert((GtkFlowBox *)flow_box, button, -1);
            }
        }
        GtkWidget *separator = gtk_separator_new(GTK_ORIENTATION_HORIZONTAL);
        gtk_box_pack_start(GTK_BOX(big_box), separator, FALSE, TRUE, 0);
    }
    GtkWidget *control_box = gtk_box_new(GTK_ORIENTATION_HORIZONTAL, 0);
    gtk_box_pack_start(GTK_BOX(big_box), control_box, TRUE, TRUE, 0);
    GtkWidget *quit_button = gtk_button_new_with_label("Quit");
    g_signal_connect(quit_button, "clicked", G_CALLBACK(handle_destroy_event), NULL);
    gtk_box_pack_start(GTK_BOX(control_box), quit_button, TRUE, FALSE, 2);
    GtkWidget *reset_button = gtk_button_new_with_label("Reset");
    g_signal_connect(reset_button, "clicked", G_CALLBACK(handle_reset_event), NULL);
    gtk_box_pack_start(GTK_BOX(control_box), reset_button, TRUE, FALSE, 2);
    GtkWidget *create_shell_script_button = gtk_button_new_with_label("Create Shell Script");
    g_signal_connect(create_shell_script_button, "clicked", G_CALLBACK(handle_create_shell_script_button), NULL);
    gtk_box_pack_start(GTK_BOX(control_box), create_shell_script_button, TRUE, FALSE, 2);
    GtkWidget *create_dockerfile_button = gtk_button_new_with_label("Create Dockerfile");
    g_signal_connect(create_dockerfile_button, "clicked", G_CALLBACK(handle_create_dockerfile_button), NULL);
    gtk_box_pack_start(GTK_BOX(control_box), create_dockerfile_button, TRUE, FALSE, 2);
    gtk_widget_show_all(window);
    gtk_main();
}

#endif


void make_interactive_choices() {
    for (;;) {
        printf("\n");
        partition_selected();
        display_set("Selected", selected_set, &num_selected, 0, MAX_NUM_FRAGS);
        display_set("Available", available_set, &num_available, 0, MAX_NUM_FRAGS);
        printf("\n(A)dd, (R)emove, Create (S)hell Script, Create (D)ockerfile, (Q)uit: ");
        char buf[255]; 
        char choice = 'A';
        fgets(buf, sizeof(buf), stdin);
        if (!isdigit(buf[0])) {
            choice = toupper(buf[0]);
            if (choice == 'Q') {
                exit(EXIT_FAILURE);
            } else if (choice == 'D') {
                output_script_instead_of_dockerfile = 0;
                break;
            } else if (choice == 'A') {
                printf("Enter numbers to add: ");
            } else if (choice == 'R') {
                printf("Enter numbers to remove: ");
            } else if (choice == 'S') {
                output_script_instead_of_dockerfile = 1;
                break;
            } else {
                continue;
            }
            fgets(buf, sizeof(buf), stdin);
        }
        char *p_context;
        char *p = strtok_r(buf, list_delimiters, &p_context);
        while (p) {
            unsigned ix = atoi(p);
            if ((choice == 'A') && (ix < num_available)) {
                check_compatibility_and_add(available_set[ix]->label, 1);
            } else if ((choice == 'R') && (ix < num_selected)) {
                mark_selection(selected_set[ix]->label, 0);
            }
            p = strtok_r(NULL, list_delimiters, &p_context);
        }
    }
}


void copy_frag_file_to_output(char *fpath, FILE *df) {
    char file_name_buf[256];
    strncpy(file_name_buf, fpath, sizeof(file_name_buf));
    FILE *ff = fopen(file_name_buf, "r");
    if (!ff) {
        fprintf(stderr, "Could not read file: %s\n", file_name_buf);
        exit(EXIT_FAILURE);
    }
    while (!feof(ff)) {
        char buf[512];
        fgets(buf, sizeof(buf), ff);
        // Skip REQUIRE lines
        char *p = strstr(buf, "REQUIRE ");
        if (p == buf) {
            continue;
        }
        // Recursively insert INCLUDE targets
        p = strstr(buf, "INCLUDE ");
        if (p == buf) {
            char *p_context;
            p = strtok_r(&(buf[8]), list_delimiters, &p_context);
            while (p) {
                char *q = strrchr(file_name_buf, '/');
                q[1] = '\0';
                strncat(file_name_buf, p, sizeof(file_name_buf));
                p = ".incl";
                strncat(file_name_buf, p, sizeof(file_name_buf));
                copy_frag_file_to_output(file_name_buf, df);
                p = strtok_r(NULL, list_delimiters, &p_context);
            }
            continue;
        }
        if (output_script_instead_of_dockerfile) {
            // Check to omit "RUN"
            p = strstr(buf, "RUN ");
            if (p == buf) {
                fprintf(df, "%s", p + 4);
                continue;
            }
            // Check to change "ENV" to "export"
            p = strstr(buf, "ENV ");
            if (p == buf) {
                fprintf(df, "export %s", p + 4);
                continue;
            }
            // Check to maybe change "COPY" to "cp -a", but just echo it for now
            p = strstr(buf, "COPY ");
            if (p == buf) {
                fprintf(df, "echo %s", buf);
                continue;
            }
            // Check for "EXPOSE", and just echo it for now
            p = strstr(buf, "EXPOSE ");
            if (p == buf) {
                fprintf(df, "echo %s", buf);
                continue;
            }
        }
        fprintf(df, "%s", buf);
    }
    fclose(ff);
}


void write_selected_list_to_file(FILE *df) {
    sort_set_by_label_and_remove_duplicates(selected_set, &num_selected);
    sort_set_by_po_num(selected_set, &num_selected);
    int need_comma = 0;
    for (int ix = 0;  (ix < num_selected);  ix++) {
        if (need_comma) {
            fprintf(df, ",");
        }
        fprintf(df, "%s", selected_set[ix]->label);
        need_comma = 1;
    }

}


void write_docker_file_contents() {
    char buf[512];
    if (!output_file_name) {
        time_t t = time(NULL);
        struct tm *tmp = localtime(&t);
        if (tmp == NULL) {
            perror("localtime");
            exit(EXIT_FAILURE);
        }
        if (output_script_instead_of_dockerfile) {
            strftime(buf, sizeof(buf), "%Y%m%d%H%M%S_Script.sh", tmp);
        } else { 
            strftime(buf, sizeof(buf), "%Y%m%d%H%M%S_Dockerfile", tmp);
        }
        output_file_name = buf;
    }
    FILE *df = fopen(output_file_name, "w");
    printf("\nWriting file: %s\n\n", output_file_name);
    // Print out the mlcc command line, followed by dependencies.  Just make
    // the mlcc command a comment for now -- consider "label" in future...
    // fprintf(df, "\nLABEL mlcc_command=\"mlcc -i ");
    num_selected = 0;
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((frags[ix].d_type != DT_DIR) && (frags[ix].flag.selected == 1)) {
            add_to_set(&(frags[ix]), selected_set, &num_selected);
        }
    }
    fprintf(df, "\n# mlcc -i%s ", (output_script_instead_of_dockerfile ? "s" : ""));
    write_selected_list_to_file(df);
    num_selected = 0;
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((frags[ix].d_type != DT_DIR) && (frags[ix].flag.selected > 1)) {
            add_to_set(&(frags[ix]), selected_set, &num_selected);
        }
    }
    if (num_selected > 0) {
        fprintf(df, "\n# Dependencies: ");
        write_selected_list_to_file(df);
    }
    // Include MLCC version info in dockerfile
    fprintf(df, "\n# mlcc version: %s: %s\n", version_string, __DATE__);
    // Copy the fragments to construct the dockerfile
    num_selected = 0;
    for (int ix = 0;  (ix < num_frags);  ix++) {
        if ((frags[ix].d_type != DT_DIR) && (frags[ix].flag.selected > 0)) {
            add_to_set(&(frags[ix]), selected_set, &num_selected);
        }
    }
    sort_set_by_po_num(selected_set, &num_selected);
    for (int ix = 0;  (ix < num_selected);  ix++) {
        if (debug) {
            printf("(%d) %s %s %d\n", ix, selected_set[ix]->fpath, selected_set[ix]->label, selected_set[ix]->po_num);
        }
        copy_frag_file_to_output(selected_set[ix]->fpath, df);
        if (!output_script_instead_of_dockerfile) {
            fprintf(df, "RUN date; df -h\n");
        }
    }
    fprintf(df, "\n");
    fclose(df);
}


void read_frag_dir(char *path, struct frag_data *parent, int depth) {
    DIR *dir = opendir(path);
    if (!dir) {
        fprintf(stderr, "Path not found: %s: Errno %s\n", path, strerror(errno));
        return;
    }
    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        char *name = entry->d_name;
        if (!strcmp(name, ".") || !strcmp(name, "..")) {
            continue;
        }
        int path_len = strlen(path_buf);
        if (path_len + strlen(name) + 2 > sizeof(path_buf)) {
            fprintf(stderr, "Path too long: %s/%s\n", path, name);
            continue;
        }
        path_buf[path_len] = '/';
        strcpy(path_buf + path_len + 1, name);
        // Resort to lstat() if readdir did not set d_type
        if (entry->d_type == DT_UNKNOWN) {
            struct stat stat_buf;
            if (lstat(path_buf, &stat_buf) == 0) {
                switch (stat_buf.st_mode & S_IFMT) {
                    case S_IFBLK:  entry->d_type = DT_BLK;  break;
                    case S_IFCHR:  entry->d_type = DT_CHR;  break;
                    case S_IFDIR:  entry->d_type = DT_DIR;  break;
                    case S_IFIFO:  entry->d_type = DT_FIFO; break;
                    case S_IFLNK:  entry->d_type = DT_LNK;  break;
                    case S_IFREG:  entry->d_type = DT_REG;  break;
                    case S_IFSOCK: entry->d_type = DT_SOCK; break;
                }
            }
        }
        if (debug) {
            printf("%*s%s\n", 4 * depth, "", path_buf);
        }
        if (!((entry->d_type == DT_REG) || (entry->d_type == DT_DIR))) {
            // FIXME: Maybe support LNK in future?
            goto truncate_path;
        }
        char *p;
        char name_buf[256];
        strncpy(name_buf, name, sizeof(name_buf));
        if (entry->d_type == DT_DIR) {
            // Check if directory has mutually exclusive packages
            p = strstr(name_buf, ".excl");
            frags[num_frags].flag.exclusive = (p == name_buf + strlen(name_buf) - 5);
            if (frags[num_frags].flag.exclusive) {
                *p = '\0';
            }
        } else {
            // Process normal files only if they end in ".frag"
            p = strstr(name_buf, ".frag");
            if (!(p == name_buf + strlen(name_buf) - 5)) {
                goto truncate_path;
            }
            *p = '\0';
            frags[num_frags].flag.selected = 0;
        }
        // Get PO number if digit prefix
        if (isdigit(name_buf[0]) && isdigit(name_buf[1]) && isdigit(name_buf[2]) && (name_buf[3] == '_') ) {
            name_buf[3] = '\0';
            frags[num_frags].po_num = atoi(name_buf);
            p = &(name_buf[4]);
        } else {
            frags[num_frags].po_num = MAX_NUM_FRAGS;
            p = name_buf;
        }
        frags[num_frags].label = strdup(p);
        frags[num_frags].fpath = strdup(path_buf);
        frags[num_frags].inode_num = entry->d_ino;
        frags[num_frags].d_type = entry->d_type;
        frags[num_frags].parent = parent;
        num_frags += 1;
        if (entry->d_type == DT_DIR) {
            // Process subdirectories recursively
            read_frag_dir(path_buf, &(frags[num_frags -1]), depth + 1);
        }
truncate_path:
        path_buf[path_len] = '\0';
    }
    closedir(dir);
}


int main(int argc, char **argv) {
    prog_name = argv[0];
    if (argc == 1) {
        fprintf(stderr, "Expecting one of { -I | -G | -i <pkg>,<pkg>... }:\n");
        display_usage_and_exit();
    }
    read_frag_dir(path_buf, NULL, 0);
    int opt;
    int list_packages = 0;
    while ((opt = getopt(argc, argv, "dGhi:Ilo:qstvV")) != -1) {
        switch (opt) {
            case 'd': debug = 1; break;
            case 'G': {
#ifdef GUI
                gui = 1;
                interactive = 0;
                gtk_init(&argc, &argv);
#endif
                break;
            }
            case 'h': display_usage_and_exit(argv[0]); break;
            case 'i': {
                char *p_context;
                char *p = strtok_r(optarg, list_delimiters, &p_context);
                while (p) {
                    check_compatibility_and_add(p, 1);
                    p = strtok_r(NULL, list_delimiters, &p_context);
                }
                break;
            }
            case 'I': gui = 0; interactive = 1; break;
            case 'l': list_packages = 1; break;
            case 'o': output_file_name = optarg; break;
            case 'q': quiet = 1; break;
            case 's': output_script_instead_of_dockerfile = 1; break;
            case 't': title_string = optarg; break;
            case 'v': verbose = 1; break;
            case 'V': display_version_and_exit(); break;
            default: display_usage_and_exit(); break;
        }
    }
    if (argc > optind) {
        fprintf(stderr, "Unexpected arg = %s\n", argv[optind]);
        exit(EXIT_FAILURE);
    }
    if (verbose) {
        int num_cpus = sysconf(_SC_NPROCESSORS_ONLN);
        printf("system has %d cpus\n", num_cpus);
        // . . . .
        fflush(stdout);
    }
    if (list_packages) {
        list_all_packages();
    }
    if (interactive) {
        make_interactive_choices();
    }
#ifdef GUI
    if (gui) {
        make_gui_choices();
    }
#endif
    if (num_selected > 0) {
        write_docker_file_contents();
    }
    exit(EXIT_SUCCESS);
}

