Expense Tracker Dashboard është një aplikacion web i zhvilluar për menaxhimin e shpenzimeve dhe të ardhurave personale. Ky projekt është ndërtuar hap-pas-hapi nga zero, duke filluar nga ideja dhe struktura bazë, deri te implementimi i frontend-it dhe backend-it, me qëllim krijimin e një sistemi të qartë, funksional dhe të zgjerueshëm për menaxhim financiar.

Projekti është realizuar si një kombinim i praktikës në frontend dhe backend, duke përfshirë konceptet kryesore të zhvillimit modern web si: state management, CRUD operacione, API, databazë relacionale dhe version control me Git.

Historia e Zhvillimit të Projektit
Zhvillimi i projektit ka nisur me përzgjedhjen e temës Expense Tracker Dashboard, si një ide e përshtatshme për të përfshirë të gjitha kërkesat kryesore të një projekti full-stack, por në një formë të kuptueshme dhe praktike.

Hapi 1 – Planifikimi dhe Struktura
Në fillim u vendos:

ndarja e projektit në frontend dhe backend

përdorimi i React për frontend

përdorimi i Node.js + Express për backend

përdorimi i MySQL si databazë

U krijua struktura bazë e folderëve dhe u inicua projekti me Git për versionim dhe menaxhim të kodit.

Hapi 2 – Frontend Development
Frontend-i u zhvillua me fokus në interaktivitet dhe përdorshmëri.

U implementuan:

Menaxhimi i transaksioneve (Add / Edit / Delete)

Menaxhimi i kategorive (Income / Expense)

Filtrimi i transaksioneve sipas:

kërkimit (search)

tipit (income / expense)

datës

Sortimi i transaksioneve:

data (newest / oldest)

shuma (high → low / low → high)

Ruajtja e përkohshme e të dhënave me localStorage

Modal forma për shtimin dhe editimin e transaksioneve

UI moderne me Tailwind CSS

Frontend-i u ndërtua fillimisht pa backend, për të siguruar që logjika dhe ndërfaqja funksionojnë saktë.

Hapi 3 – Backend Development
Backend-i u ndërtua nga zero duke ndjekur praktikat standarde të Node.js.

U realizuan:

Inicimi i backend-it me Express

Konfigurimi i dotenv për variabla ambienti

Krijimi i serverit kryesor (server.js)

Krijimi i lidhjes me databazën MySQL

Endpoint për testim (/health dhe /db-health)

Struktura e organizuar:

config

routes

controllers

middleware

Databaza MySQL u dizajnua me tabela për:

users

categories

transactions

Hapi 4 – Version Control & GitHub
Projekti u versionua duke përdorur:

Git

Git Bash

GitHub repository

U realizuan:

konfigurimi i Git (username & email)

commit-et fillestare

krijimi i branch main

push i projektit në GitHub

Teknologjitë e Përdorura
Frontend
React

Vite

Tailwind CSS

JavaScript (ES6+)

HTML5

CSS3

LocalStorage (për data fake / prototyping)

Backend
Node.js

Express.js

MySQL

mysql2

dotenv

cors

JSON

REST API koncept

Tools & Environment
Visual Studio Code

Git & Git Bash

GitHub

MySQL / phpMyAdmin

npm

Autorët
Ky projekt është zhvilluar nga:

Rina Hoti

Rinesa Smajli

Qëllimi i Projektit
Qëllimi kryesor i këtij projekti është:

të demonstrojë njohuritë në zhvillimin full-stack

të tregojë procesin real të ndërtimit të një aplikacioni web

të shërbejë si bazë për zgjerime të ardhshme (authentication, API reale, deployment)