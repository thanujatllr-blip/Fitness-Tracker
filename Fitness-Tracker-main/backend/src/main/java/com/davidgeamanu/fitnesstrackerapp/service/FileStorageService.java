package com.davidgeamanu.fitnesstrackerapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;


@Service
public interface FileStorageService {

    String storeProfilePicture(MultipartFile file, Long userId) throws IOException;

    void deleteProfilePicture(String filename) throws IOException;

    Path loadProfilePicture(String filename);
}