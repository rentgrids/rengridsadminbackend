import { PropertyDocument, Property, User } from '../models/sequelize/associations.js';
import { formatResponse } from '../utils/helpers.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import { uploadPropertyDocuments } from '../middleware/upload.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export class PropertyDocumentController {
  static uploadDocument = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    (req, res, next) => {
      uploadPropertyDocuments(req, res, (err) => {
        if (err) {
          return res.status(400).json(formatResponse(false, err.message));
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const { id } = req.params;
        const { document_type = 'other' } = req.body;

        if (!req.file) {
          return res.status(400).json(formatResponse(false, 'No document file uploaded'));
        }

        // Check if property exists
        const property = await Property.findOne({
          where: { id, is_deleted: false }
        });

        if (!property) {
          return res.status(404).json(formatResponse(false, 'Property not found'));
        }

        const document = await PropertyDocument.create({
          property_id: id,
          document_url: `/uploads/properties/documents/${req.file.filename}`,
          document_type,
          document_name: req.file.originalname,
          file_size: req.file.size,
          mime_type: req.file.mimetype,
          uploaded_by: req.admin.id,
        });

        logger.info(`Document uploaded for property: ${id}`);
        res.status(201).json(formatResponse(true, 'Document uploaded successfully', {
          documentId: document.id,
          document_url: document.document_url,
          document_type: document.document_type,
        }));
      } catch (error) {
        logger.error('PropertyDocumentController uploadDocument error:', error);
        res.status(500).json(formatResponse(false, 'Failed to upload document'));
      }
    }
  ];

  static getPropertyDocuments = [
    verifyAdminJWT,
    requirePermission('property', 'view'),
    async (req, res) => {
      try {
        const { id } = req.params;

        // Check if property exists
        const property = await Property.findOne({
          where: { id, is_deleted: false }
        });

        if (!property) {
          return res.status(404).json(formatResponse(false, 'Property not found'));
        }

        const documents = await PropertyDocument.findAll({
          where: { property_id: id },
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email'],
            }
          ],
          order: [['created_at', 'DESC']],
        });

        res.json(formatResponse(true, 'Property documents retrieved successfully', documents));
      } catch (error) {
        logger.error('PropertyDocumentController getPropertyDocuments error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve property documents'));
      }
    }
  ];

  static deleteDocument = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    async (req, res) => {
      try {
        const { docId } = req.params;

        const document = await PropertyDocument.findByPk(docId);

        if (!document) {
          return res.status(404).json(formatResponse(false, 'Document not found'));
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'uploads', document.document_url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await document.destroy();

        logger.info(`Document deleted: ${docId}`);
        res.json(formatResponse(true, 'Document deleted successfully'));
      } catch (error) {
        logger.error('PropertyDocumentController deleteDocument error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete document'));
      }
    }
  ];
}