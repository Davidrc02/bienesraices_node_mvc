import request from 'supertest';
import { expect } from 'chai';
import app from '../../index.js';

describe('PropiedadController Tests', () => {
    describe('GET /mis-propiedades', () => {
        it('should return 302 and message "La pagina actual no estaba correctamente puesta"', (done) => {
            request(app)
                .get('/mis-propiedades')
                .expect(302)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('La pagina actual no estaba correctamente puesta');
                })
                .end(done);
        });
    });
    describe('GET /mis-propiedades?pagina=1', () => {
        it('should return 200 and message "Las propiedades han sido encontradas"', (done) => {
            request(app)
                .get('/mis-propiedades?pagina=1')
                .set('id', 2)
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Las propiedades han sido encontradas');
                })
                .end(done);
        });
    });

    describe('GET /propiedades/crear', () => {
        it('should return 200 and message "La pagina para crear una propiedad ha sido cargada"', (done) => {
            request(app)
                .get('/propiedades/crear')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('La pagina para crear una propiedad ha sido cargada');
                })
                .end(done);
        });
    });
    describe('POST /propiedades/crear', () => {
        it('should return 400 and message "Ha habido un error en el formulario de creacion"', (done) => {
            request(app)
                .post('/propiedades/crear')
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Ha habido un error en el formulario de creacion');
                })
                .end(done);
        });
    });
    describe('POST /propiedades/crear', () => {
        it('should return 302 and message "Redireccionamiento a agregar imagen"', (done) => {
            request(app)
                .post('/propiedades/crear')
                .set('id', 2)
                .set('titulo', 'Casa de Lujo Increible')
                .set('descripcion', 'Casa de Lujo Increible en Rinconada')
                .set('categoria', 1)
                .set('precio', 2)
                .set('habitaciones', 2)
                .set('estacionamiento', 2)
                .set('wc', 2)
                .set('calle', 'Avenida de Grecia Nº59')
                .set('lat', 37.48)
                .set('lng', -5.98)
                .expect(302)
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Redireccionamiento a agregar imagen');
                })
                .end(done);
        });
    });

});
