import request from 'supertest';
import { expect } from 'chai';
import app from '../../index.js';

////////////////////////////////////////////////////////////////
///////////////////////////TESTS LOGIN//////////////////////////
////////////////////////////////////////////////////////////////

describe('UsuarioController Tests Login', () => {
    describe('GET /auth/login', () => {
        it('should return 200 and message "Formulario de login cargado correctamente"', (done) => {
            request(app)
                .get('/auth/login')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Formulario de login cargado correctamente');
                })
                .end(done);
        });
    });
    describe('POST /auth/login', () => {
        it('should return 302 and message "Autenticacion exitosa" for succesfull result and redirection', (done) => {
            request(app)
                .post('/auth/login')
                .set('email', 'david@gmail.com')
                .set('password', 'password')
                .expect(302)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Autenticacion exitosa');
                })
                .end(done);
        });
    });
    describe('POST /auth/login', () => {
        it('should return 400 and message "Error de validacion en la autenticacion" for validation errors', (done) => {
            request(app)
                .post('/auth/login')
                .set('email', 'david')
                .set('password', '')
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Error de validacion en la autenticacion');
                })
                .end(done);

        });
    });
    describe('POST /auth/login', () => {
        it('should return 404 and message "El Usuario No Existe" for no existing user', (done) => {
            request(app)
                .post('/auth/login')
                .set('email', 'david1@gmail.com')
                .set('password', 'password')
                .expect(404)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El Usuario No Existe');
                })
                .end(done);

        });
    });
    describe('POST /auth/login', () => {
        it('should return 401 and message "El Usuario No Esta Confirmado" for no confirmed user', (done) => {
            request(app)
                .post('/auth/login')
                .set('email', 'fran@gmail.com')
                .set('password', 'password')
                .expect(401)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El Usuario No Esta Confirmado');
                })
                .end(done);

        });
    });
    describe('POST /auth/login', () => {
        it('should return 401 and message "El Password es incorrecto!" for no correct password', (done) => {
            request(app)
                .post('/auth/login')
                .set('email', 'david@gmail.com')
                .set('password', 'passsfaword')
                .expect(401)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El Password es incorrecto!');
                })
                .end(done);
        });
    });
});

////////////////////////////////////////////////////////////////
/////////////////////////TESTS REGISTRO/////////////////////////
////////////////////////////////////////////////////////////////

describe('UsuarioController Tests Registro', () => {
    describe('GET /auth/registro', () => {
        it('should return 200 and message "Formulario de registro cargado correctamente"', (done) => {
            request(app)
                .get('/auth/registro')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Formulario de registro cargado correctamente');
                })
                .end(done);
        });
    });
    describe('POST /auth/registro', () => {
        const nombre = Array.from({ length: 6 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97))).join('');
        const emailAleatorio = nombre + '@gmail.com';
        it('should return 201 and message "El usuario se ha creado correctamente" for succesfull result and redirection', (done) => {
            request(app)
                .post('/auth/registro')
                .set('nombre', nombre)
                .set('email', emailAleatorio)
                .set('password', 'password')
                .set('repetir_password', 'password')
                .expect(201)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El usuario se ha creado correctamente');
                })
                .end(done);
        });
    });
    describe('POST /auth/registro', () => {
        it('should return 400 and message "Error de validacion en la autenticacion" for validation errors', (done) => {
            request(app)
                .post('/auth/registro')
                .set('nombre', 'david')
                .set('email', 'david')
                .set('password', 'david')
                .set('repetir_password', 'david')
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Error de validacion en la autenticacion');
                })
                .end(done);

        });
    });
    describe('POST /auth/registro', () => {
        it('should return 409 and message "El usuario ya existe" for existing user', (done) => {
            request(app)
                .post('/auth/registro')
                .set('nombre', 'david')
                .set('email', 'david@gmail.com')
                .set('password', 'password')
                .set('repetir_password', 'password')
                .expect(409)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El usuario ya existe');
                })
                .end(done);

        });
    });
});

////////////////////////////////////////////////////////////////
/////////////////////////TESTS LOGOUT/////////////////////////
////////////////////////////////////////////////////////////////

describe('UsuarioController Tests Logout', () => {
    describe('POST /auth/cerrar-sesion', () => {
        it('should return 302 and message "Ha cerrado sesion exitosamente"', (done) => {
            request(app)
                .post('/auth/cerrar-sesion')
                .expect(302)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Ha cerrado sesion exitosamente');
                })
                .end(done);
        });
    });
});

////////////////////////////////////////////////////////////////
/////////////////////////TESTS CONFIRMAR////////////////////////
////////////////////////////////////////////////////////////////

describe('UsuarioController Tests Confirmar', () => {
    //Modificar si queremos que actualice al usuario con este token
    describe('GET /auth/confirmar/#1hv5pto1rprd3fgrcpgo', () => {
        it('should return 200 and message "El usuario se ha confirmado correctamente"', (done) => {
            request(app)
                .get('/auth/confirmar/1hv5pto1rprd3fgrcpgo')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El usuario se ha confirmado correctamente');
                })
                .end(done);
        });
    });
    describe('GET /auth/confirmar/1hv5pto1rprd3fgrc', () => {
        it('should return 403 and message "Error al confirmar"', (done) => {
            request(app)
                .get('/auth/confirmar/1hv5pto1rprd3fgrc')
                .expect(403) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Error al confirmar');
                })
                .end(done);
        });
    });
});

////////////////////////////////////////////////////////////////
///////////////////////OTRA FORMA DE HACERLO////////////////////
////////////////////////////////////////////////////////////////

// describe('UsuarioController Tests', () => {
//     describe('POST /auth/login', () => {
//         it('should return 302 and message "Autenticación exitosa" for succesfull result and redirection', async () => {
//             try {
//                 await request(app)
//                     .post('/auth/login')
//                     .set('email', 'david@gmail.com')
//                     .set('password', 'password')
//                     .expect(302)
//                     .expect((res) => {
//                         expect(res.headers['x-test-message']).to.equal('Autenticación exitosa');
//                     });
//             } catch (error) {
//                 throw error; // Propaga el error para que Mocha pueda manejarlo
//             }
//         });
//     });
// });

