const request = require('supertest');
const express = require('express');

const { getReportById } = require('../../src/controllers/reports');
const {getReports} = require('../../src/controllers/reports');
const { createReport } = require('../../src/controllers/reports');
const { updateReport } = require('../../src/controllers/reports');
const mongoose = require('mongoose');

jest.mock('../../src/models/Report');

const Report = require('../../src/models/report');

const app = express();

app.use(express.json());

app.get('/api/reports/:report_id', getReportById);
app.get('/api/reports', getReports);
app.post('/api/reports', createReport);
app.put('/api/reports/:report_id', updateReport);


describe ('GET /api/reports/:report_id', () => {
   it ('debe retornar el post y codigo 200', async () => {
        const reportId = '60d5f484f1c2b8b8a4e4e4e4';
        const mockReport = {
            _id: reportId,
            reporter: { name: 'John Doe' },
            post: { author: { name: 'Jane Doe' } },
            answer: { author: { name: 'Alice' } }
        };

       Report.findById = jest.fn().mockReturnValue({
         populate: jest.fn().mockReturnValue({
           populate: jest.fn().mockReturnValue({
             populate: jest.fn().mockResolvedValue(mockReport)
           })
         })
       });



        const response = await request(app).get(`/api/reports/${reportId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockReport);

   });

   it ('debe retornar codigo 404 y mensaje de que no se encontro', async () => {
           const reportId = '60d5f484f1c2b8b8a4e4e4e4';

           Report.findById = jest.fn().mockReturnValue({
                   populate: jest.fn().mockReturnValue({
                     populate: jest.fn().mockReturnValue({
                       populate: jest.fn().mockResolvedValue(null)
                     })
                   })
                 });

           const response = await request(app).get(`/api/reports/${reportId}`);

           expect(response.statusCode).toBe(404);

   });

    it ('debe retornar codigo 404 y mensaje de que no se encontro', async () => {
         const reportId = '60d5f484f1c2b8b8a4e4e4e4';

          Report.findById = jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                      populate: jest.fn().mockRejectedValue(new Error('Error al recuperar el reporte'))
                    })
                  })
          });

         const response = await request(app).get(`/api/reports/${reportId}`);

         expect(response.statusCode).toBe(500);
    });
});


describe ('GET /api/reports', () => {
    it ('debe retornar todos los reportes y codigo 200', async () => {
        const mockReports = [
            { _id: '60d5f484f1c2b8b8a4e4e4e4', reporter: { name: 'John Doe' } },
            { _id: '60d5f484f1c2b8b8a4e4e4e5', reporter: { name: 'Jane Doe' } }
        ];

        const populateMock = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockReports)
                  })
                })
              });
        const sortMock  = jest.fn().mockReturnValue({ populate : populateMock });
        const limitMock = jest.fn().mockReturnValue({ sort : sortMock });
        const skipMock = jest.fn().mockReturnValue({ limit : limitMock });
        Report.find = jest.fn().mockReturnValue({
            skip: skipMock
        });
        Report.countDocuments = jest.fn().mockResolvedValue(20);

        const response = await request(app).get('/api/reports?page=1&limit=10');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            currentPage: 1,
            totalPages: 2,
            totalReports: 20,
            reports: mockReports
        });
    });

    it ('debe retornar codigo 500 y mensaje de error', async () => {
       const populateMock = jest.fn().mockReturnValue({
                      populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                          populate: jest.fn().mockRejectedValue(new Error('Error al recuperar los reportes'))
                        })
                      })
                    });
              const sortMock  = jest.fn().mockReturnValue({ populate : populateMock });
              const limitMock = jest.fn().mockReturnValue({ sort : sortMock });
              const skipMock = jest.fn().mockReturnValue({ limit : limitMock });
              Report.find = jest.fn().mockReturnValue({
                  skip: skipMock
              });
              Report.countDocuments = jest.fn().mockResolvedValue(20);

              const response = await request(app).get('/api/reports?page=1&limit=10');

              expect(response.statusCode).toBe(500);
    });
});


describe ('POST /api/reports', () => {
    it ('debe crear un nuevo reporte y retornar codigo 201', async () => {
        const newReport = {
            reporter : '60d5f484f1c2b8b8a4e4e4e4',
            reason: 'Inappropriate content',
            post: '60d5f484f1c2b8b8a4e4e4e5'
        };

        Report.create = jest.fn().mockResolvedValue(newReport);

        const response = await request(app).post('/api/reports').send(newReport);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(newReport);
    });

     it ('debe retornar 400 y decir que falta la razon', async () => {
            const newReport = {
                reporter : '60d5f484f1c2b8b8a4e4e4e4',
                post: '60d5f484f1c2b8b8a4e4e4e5'
            };

            Report.create = jest.fn().mockResolvedValue(newReport);

            const response = await request(app).post('/api/reports').send(newReport);

            expect(response.statusCode).toBe(400);
     });

    it ('debe retornar 500 y decir que hubo un error', async () => {
        const newReport = {
            reason: 'Inappropriate content',
            reporter : '60d5f484f1c2b8b8a4e4e4e4',
            post: '60d5f484f1c2b8b8a4e4e4e5'
        };

        Report.create = jest.fn().mockRejectedValue(new Error('Error al crear el reporte'));

        const response = await request(app).post('/api/reports').send(newReport);

        expect(response.statusCode).toBe(500);
    });
});


describe ('PUT /api/reports/:report_id', () => {
    it ('debe actualizar un reporte y retornar codigo 200', async () => {
        const reportId = '60d5f484f1c2b8b8a4e4e4e4';
        const updatedReport = {
            _id: reportId,
            reason: 'Updated reason',
            status: 'Checked'
        };
        Report.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedReport);
        const response = await request(app).put(`/api/reports/${reportId}`).send({ status: 'Checked' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(updatedReport);

    });

    it ('debe retornar 400 y decir que falta el estado', async () => {
        const reportId = '60d5f484f1c2b8b8a4e4e4e4';
        Report.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
        const response = await request(app).put(`/api/reports/${reportId}`).send({});
        expect(response.statusCode).toBe(400);
    });

    it ('debe retornar 404 y decir que no se encontro el reporte', async () => {
        const reportId = '60d5f484f1c2b8b8a4e4e4e4';
        Report.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
        const response = await request(app).put(`/api/reports/${reportId}`).send({ status: 'Checked' });
        expect(response.statusCode).toBe(404);
    });

    it ('debe retornar 500 y decir que hubo un error', async () => {
        const reportId = '60d5f484f1c2b8b8a4e4e4e4';
        Report.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Error al actualizar el reporte'));
        const response = await request(app).put(`/api/reports/${reportId}`).send({ status: 'Checked' });
        expect(response.statusCode).toBe(500);
    });

});