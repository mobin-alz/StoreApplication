package com.storeapplication.utils;


import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;

import javax.imageio.ImageIO;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

public class ImageUtil {

    public static String saveImageWithOrientation(MultipartFile file, String uploadDir) throws Exception {
        if (file == null || file.isEmpty()) {
            return null;
        }

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File outputFile = new File(dir, fileName);

        InputStream inputStream = file.getInputStream();
        BufferedImage img = ImageIO.read(inputStream);

        inputStream.close();
        inputStream = file.getInputStream();
        Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
        int orientation = 1;
        var dirExif = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        if (dirExif != null && dirExif.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
            orientation = dirExif.getInt(ExifIFD0Directory.TAG_ORIENTATION);
        }
        inputStream.close();

        BufferedImage rotated = applyOrientation(img, orientation);

        ImageIO.write(rotated, "jpg", outputFile);

        return outputFile.getAbsolutePath();
    }

    private static BufferedImage applyOrientation(BufferedImage img, int orientation) {
        int width = img.getWidth();
        int height = img.getHeight();
        AffineTransform transform = new AffineTransform();

        switch (orientation) {
            case 6: // 90 درجه
                transform.translate(height, 0);
                transform.rotate(Math.toRadians(90));
                return new AffineTransformOp(transform, AffineTransformOp.TYPE_BILINEAR)
                        .filter(img, new BufferedImage(height, width, img.getType()));
            case 3: // 180 درجه
                transform.translate(width, height);
                transform.rotate(Math.toRadians(180));
                return new AffineTransformOp(transform, AffineTransformOp.TYPE_BILINEAR)
                        .filter(img, new BufferedImage(width, height, img.getType()));
            case 8: // 270 درجه
                transform.translate(0, width);
                transform.rotate(Math.toRadians(270));
                return new AffineTransformOp(transform, AffineTransformOp.TYPE_BILINEAR)
                        .filter(img, new BufferedImage(height, width, img.getType()));
            default:
                return img;
        }
    }
}
