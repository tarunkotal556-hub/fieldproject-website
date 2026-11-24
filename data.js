/* Rows copied from the project DBMS tables (campusdb) */
const SEED = {
  student: [
    [1,'Pranjal Gaikwad','pranjal@gmail.com','9876543210','pranjal01','Pran@101','Computer Science','SYBSc CS'],
    [2,'Aarav Sharma','aarav@gmail.com','9876543211','aarav02','Aarav@202','Information Technology','TYBSc IT'],
    [3,'Tushar Bhosale','tushar@gmail.com','9876543212','tushar03','Tushar@303','Commerce','SYBCom'],
    [4,'Riya Kulkarni','riya@gmail.com','9876543213','riya04','Riya@404','Physics','SYBSc Physics'],
    [5,'Aditya Joshi','aditya@gmail.com','9876543214','aditya05','Adi@505','Mathematics','TYBSc Mathematics'],
    [6,'Neha Deshmukh','neha@gmail.com','9876543215','neha06','Neha@606','Electronics','SYBSc Electronics'],
    [7,'Om More','om@gmail.com','9876543216','om07','Om@707','Statistics','SYBSc Statistics'],
    [8,'Debgopal Kotale','debgopal@gmail.com','9876543217','debgopal08','Deb@808','English','SYBA English'],
    [9,'Rahul Pawar','rahul@gmail.com','9876543218','rahul09','Rahul@909','Economics','SYBA Economics'],
    [10,'Isha Jadhav','isha@gmail.com','9876543219','isha10','Isha@1010','Psychology','SYBA Psychology']
  ].map(r=>({student_id:r[0],student_name:r[1],email:r[2],phone:r[3],username:r[4],password:r[5],department:r[6],class_name:r[7]})),
  item: [
    [101,'Laptop','Electronics','Dell laptop','Black','Dell','Small sticker near keyboard','laptop1.jpg'],
    [102,'Mobile Phone','Electronics','Samsung mobile phone','Blue','Samsung','Scratch on back cover','mobile1.jpg'],
    [103,'Wallet','Personal Item','Leather wallet','Brown','Wildcraft','Initials printed inside','wallet1.jpg'],
    [104,'Calculator','Stationery','Scientific calculator','Black','Casio','Name written on back','calculator1.jpg'],
    [105,'Backpack','Bags','College backpack','Grey','Skybags','Red keychain attached','bag1.jpg'],
    [106,'USB Drive','Electronics','USB storage drive','Silver','HP','Blue cap','usb1.jpg'],
    [107,'Books','Study Material','Academic books','Blue','Oxford','Name label on first page','books1.jpg'],
    [108,'Keys','Personal Item','Set of keys','Silver','Godrej','Red key ring','keys1.jpg'],
    [109,'Earphones','Electronics','Wireless earphones','White','Boat','Small black mark on case','earphones1.jpg'],
    [110,'ID Card','College Document','College identity card','White','College','Blue lanyard','idcard1.jpg']
  ].map(r=>({item_id:r[0],item_name:r[1],category:r[2],description:r[3],color:r[4],brand:r[5],identification_mark:r[6],image_url:r[7]})),
  lost_item: [[201,1,'2026-09-01'],[202,2,'2026-09-02'],[203,3,'2026-09-03'],[204,4,'2026-09-04'],[205,5,'2026-09-05'],[206,6,'2026-09-06'],[207,7,'2026-09-07'],[208,8,'2026-09-08'],[209,9,'2026-09-09'],[210,10,'2026-09-10']]
    .map(r=>({lost_item_id:r[0],student_id:r[1],status:'Lost',reported_date:r[2]})),
  found_item: [[301,2,'2026-09-11'],[302,3,'2026-09-12'],[303,4,'2026-09-13'],[304,5,'2026-09-14'],[305,6,'2026-09-15'],[306,7,'2026-09-16'],[307,8,'2026-09-17'],[308,9,'2026-09-18'],[309,10,'2026-09-19'],[310,1,'2026-09-20']]
    .map(r=>({found_item_id:r[0],student_id:r[1],status:'Found',reported_date:r[2]})),
  found_post: [
    [301,102,'2026-09-10','10:00','College Library','Samsung phone found in library','mobile1.jpg','Email'],
    [302,103,'2026-09-11','12:30','Main Building','Brown wallet found in main building','wallet1.jpg','Phone'],
    [303,104,'2026-09-12','14:15','Physics Laboratory','Casio calculator found in laboratory','calculator1.jpg','Email'],
    [304,105,'2026-09-13','11:20','College Ground','Grey backpack found on ground','bag1.jpg','Phone'],
    [305,106,'2026-09-14','15:30','Computer Laboratory','HP USB drive found in computer lab','usb1.jpg','Email'],
    [306,107,'2026-09-15','16:10','Library','Books found in library','books1.jpg','Phone'],
    [307,108,'2026-09-16','09:45','Parking Area','Keys found near parking area','keys1.jpg','Email'],
    [308,109,'2026-09-17','13:00','Seminar Hall','Boat earphones found in seminar hall','earphones1.jpg','Phone'],
    [309,110,'2026-09-18','11:00','College Office','ID card found near college office','idcard1.jpg','Email'],
    [310,101,'2026-09-19','14:45','Canteen','Dell laptop found near canteen','laptop1.jpg','Phone']
  ].map(r=>({found_item_id:r[0],item_id:r[1],found_date:r[2],found_time:r[3],found_location:r[4],description:r[5],image_url:r[6],contact_preference:r[7],post_status:'Active'})),
  lost_post: [
    [201,101,'2026-08-30','10:30','College Library','Dell laptop lost in library','laptop1.jpg','Email'],
    [202,102,'2026-08-31','12:15','College Canteen','Samsung phone lost near canteen','mobile1.jpg','Phone'],
    [203,103,'2026-09-01','14:00','Main Building','Brown wallet lost in main building','wallet1.jpg','Email'],
    [204,104,'2026-09-02','11:45','Physics Laboratory','Casio calculator lost in laboratory','calculator1.jpg','Phone'],
    [205,105,'2026-09-03','13:20','College Ground','Grey backpack lost on ground','bag1.jpg','Email'],
    [206,106,'2026-09-04','15:10','Computer Laboratory','HP USB drive lost in computer lab','usb1.jpg','Phone'],
    [207,107,'2026-09-05','16:00','Library','Books lost in library','books1.jpg','Email'],
    [208,108,'2026-09-06','09:30','Parking Area','Keys lost near parking area','keys1.jpg','Phone'],
    [209,109,'2026-09-07','14:30','Seminar Hall','Boat earphones lost in seminar hall','earphones1.jpg','Email'],
    [210,110,'2026-09-08','12:00','College Office','ID card lost near college office','idcard1.jpg','Phone']
  ].map(r=>({lost_item_id:r[0],item_id:r[1],lost_date:r[2],lost_time:r[3],lost_location:r[4],description:r[5],image_url:r[6],contact_preference:r[7],post_status:'Active'})),
  products: [
    [1,'DBMS Concepts Book','Books',250,'sold'],[2,'Data Structures Using C','Books',300,'available'],
    [3,'Scientific Calculator','Gadgets',600,'sold'],[4,'Wired Earphones','Gadgets',350,'available'],
    [5,'Java Programming Book','Books',280,'available'],[6,'Pen Drive 32GB','Gadgets',400,'available'],
    [7,'Power Bank 10000mAh','Gadgets',800,'sold'],[8,'Operating System Book','Books',220,'available'],
    [9,'Bluetooth Speaker','Gadgets',1200,'available'],[10,'Python Programming Book','Books',270,'available']
  ].map(r=>({product_id:r[0],product_name:r[1],category:r[2],cost:r[3],status:r[4]})),
  product_posts: [
    [1,1,'DBMS book for SYBSc CS, no torn pages','Good','images/dbms_book.jpg','9876543210','2026-10-01 10:00:00'],
    [2,2,'Data Structures book with notes inside','Fair','images/ds_book.jpg','9876543212','2026-10-01 11:30:00'],
    [3,3,'Casio scientific calculator, works perfectly','Like New','images/calculator.jpg','9876543213','2026-10-02 09:15:00'],
    [4,4,'Wired earphones with mic, 6 months old','Good','images/earphones.jpg','9876543216','2026-10-02 14:00:00'],
    [5,5,'Java book, latest edition','Like New','images/java_book.jpg','9876543218','2026-10-03 16:45:00'],
    [6,6,'32GB pen drive, 3.0 speed','Good','images/pendrive.jpg','9876543219','2026-10-03 18:20:00'],
    [7,7,'Power bank, 10000mAh, charges 3 times','Good','images/powerbank.jpg','9876543215','2026-10-04 12:10:00'],
    [8,8,'Operating System book, slightly used','Fair','images/os_book.jpg','9876543211','2026-10-04 15:00:00'],
    [9,9,'Bluetooth speaker with 8 hour battery','Good','images/speaker.jpg','9876543212','2026-10-05 10:30:00'],
    [10,10,'Python book for beginners','Like New','images/python_book.jpg','9876543216','2026-10-05 17:00:00']
  ].map(r=>({post_id:r[0],product_id:r[1],description:r[2],condition:r[3],image_url:r[4],contact_info:r[5],post_date:r[6]})),
  transactions: [[1,2,1,250,'COMPLETED','2026-10-06 11:00:00'],[2,5,4,600,'COMPLETED','2026-10-07 13:30:00'],[3,8,6,800,'COMPLETED','2026-10-08 16:15:00']]
    .map(r=>({transaction_id:r[0],buyer_id:r[1],seller_id:r[2],total_amount:r[3],status:r[4],created_at:r[5]})),
  payments: [[1,1,'UPI',250,'UPI2026100611001','SUCCESS','2026-10-06 11:02:00'],[2,2,'CREDIT_CARD',600,'CC2026100713302','SUCCESS','2026-10-07 13:33:00'],[3,3,'NET_BANKING',800,'NB2026100816153','SUCCESS','2026-10-08 16:18:00']]
    .map(r=>({payment_id:r[0],transaction_id:r[1],payment_method:r[2],amount_paid:r[3],gateway_reference_id:r[4],status:r[5],paid_at:r[6]})),
  transaction_products: [[1,1,250],[2,3,600],[3,7,800]].map(r=>({transaction_id:r[0],product_id:r[1],cost:r[2]}))
};
