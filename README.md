# Scrapping Avalaible product Cdiscount

check each minute if a product is avalaible in Cdiscount website. If the product is avalaible
it send an email and stop the program

## how to use

Use yarn start to launch app with 2 differents parameter :

- url : url of the product in cdiscount
- email : email adress to receive notification ( work with gmail adresses)

example :

```bash
 yarn start --url='https://www.cdiscount.com/jeux-pc-video-console/ps5/console-ps5-sony-ps5/f-10350-son3665540797413.html' --email='test@gmail.com'
```

Antivirus may block email send

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
