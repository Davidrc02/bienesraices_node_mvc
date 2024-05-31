import request from 'supertest';
import { expect } from 'chai';
import app from '../../index.js';


describe('ApiController Tests', () => {
    describe('GET /propiedades', () => {
        it('should return 200 and a list of properties', (done) => {
            request(app)
                .get('/api/propiedades')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect((res) => {
                    expect(res.body).to.be.an('array'); // Verificamos que la respuesta es un array
                })
                .end(done);
        });
    });
});