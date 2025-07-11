import { PropertyImage, Property, User } from '../models/sequelize/associations.js';
import { formatResponse } from '../utils/helpers.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import { uploadPropertyImages } from '../middleware/upload.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export class PropertyImageController {
  static uploadImages = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    (req, res, next) => {
      uploadPropertyImages(req, res, (err) => {
        if (err) {
          return res.status(400).json(formatResponse(false, err.message));
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const { id } = req.params;
        const { image_type = 'gallery', is_featured = false } = req.body;

        if (!req.files || req.files.length === 0) {
          return res.status(400).json(formatResponse(false, 'No image files uploaded'));
        }

        // Check if property exists
        const property = await Property.findOne({
          where: { id, is_deleted: false }
        });

        if (!property) {
          return res.status(404).json(formatResponse(false, 'Property not found'));
        }

        // If setting as featured, remove featured flag from other images
        if (is_featured === 'true' || is_featured === true) {
          await PropertyImage.update(
            { is_featured: false },
            { where: { property_id: id } }
          );
        }

        const imagePromises = req.files.map((file, index) => {
          return PropertyImage.create({
            property_id: id,
            image_url: `/uploads/properties/images/${file.filename}`,
            image_type,
            is_featured: index === 0 && (is_featured === 'true' || is_featured === true),
            sort_order: index,
            alt_text: `${property.title} - Image ${index + 1}`,
            uploaded_by: req.admin.id,
          });
        });

        const images = await Promise.all(imagePromises);

        logger.info(`${images.length} images uploaded for property: ${id}`);
        res.status(201).json(formatResponse(true, `${images.length} images uploaded successfully`, {
          images: images.map(img => ({
            id: img.id,
            image_url: img.image_url,
            image_type: img.image_type,
            is_featured: img.is_featured,
          }))
        }));
      } catch (error) {
        logger.error('PropertyImageController uploadImages error:', error);
        res.status(500).json(formatResponse(false, 'Failed to upload images'));
      }
    }
  ];

  static getPropertyImages = [
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

        const images = await PropertyImage.findAll({
          where: { property_id: id },
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email'],
            }
          ],
          order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
        });

        res.json(formatResponse(true, 'Property images retrieved successfully', images));
      } catch (error) {
        logger.error('PropertyImageController getPropertyImages error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve property images'));
      }
    }
  ];

  static deleteImage = [
    verifyAdminJWT,
    requirePermission('property', 'edit'),
    async (req, res) => {
      try {
        const { imageId } = req.params;

        const image = await PropertyImage.findByPk(imageId);

        if (!image) {
          return res.status(404).json(formatResponse(false, 'Image not found'));
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), 'uploads', image.image_url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await image.destroy();

        logger.info(`Image deleted: ${imageId}`);
        res.json(formatResponse(true, 'Image deleted successfully'));
      } catch (error) {
        logger.error('PropertyImageController deleteImage error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete image'));
      }
    }
  ];
}