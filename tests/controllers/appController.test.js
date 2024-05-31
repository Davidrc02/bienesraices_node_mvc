import request from 'supertest';
import { expect } from 'chai';
import app from '../../index.js';

describe('AppController Tests', () => {
    describe('GET /', () => {
        it('should return 200 and message "El inicio ha sido cargado correctamente"', (done) => {
            request(app)
                .get('/')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('El inicio ha sido cargado correctamente');
                })
                .end(done);
        });
    });
    describe('GET /categorias/-1', () => {
        it('should return 302 and message "Se ha redireccionado a 404"', (done) => {
            request(app)
                .get('/categorias/-1')
                .expect(302) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Se ha redireccionado a 404');
                })
                .end(done);
        });
    });
    describe('GET /categorias/1', () => {
        it('should return 200 and message "Se han cargado correctamente las categorias"', (done) => {
            request(app)
                .get('/categorias/1')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Se han cargado correctamente las categorias');
                })
                .end(done);
        });
    });
    describe('GET /404', () => {
        it('should return 404 and message "Pagina no Encontrada"', (done) => {
            request(app)
                .get('/404')
                .expect(404) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('Pagina no Encontrada');
                })
                .end(done);
        });
    });
    describe('POST /buscador', () => {
        it('should return 302 and message "No se ha escrito nada"', (done) => {
            request(app)
                .post('/buscador')
                .set('termino', '  ')
                .expect(302) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('No se ha escrito nada');
                })
                .end(done);
        });
    });
    describe('POST /buscador', () => {
        it('should return 200 and message "La busqueda se ha realizado con exito"', (done) => {
            request(app)
                .post('/buscador')
                .set('termino', 'casa')
                .expect(200) 
                .expect((res) => {
                    expect(res.headers['x-test-message']).to.equal('La busqueda se ha realizado con exito');
                })
                .end(done);
        });
    });
});